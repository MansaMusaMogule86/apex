"""
APEX Swarm Intelligence Engine
==============================
Multi-agent swarm system powered by Ollama for the APEX Command Center.

Agents:
- Market Intelligence Agent: Market dynamics, competitor analysis, forecasting
- Lead Intelligence Agent: Lead scoring, buyer intent, VIP segmentation  
- Risk Sentinel: Brand safety, anomaly detection, alert generation
- Founder Authority Agent: Authority positioning, narrative intelligence, trust metrics
- Scenario Simulator Agent: Strategic simulations, competitor response modeling
- AI Recommendation Engine: Cross-agent orchestration, priority scoring

Author: APEX Intelligence Team
Created: 2026-05-15
"""

import asyncio
import json
import logging
import os
import time
import uuid
from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum
from typing import Any, AsyncGenerator, Callable, Dict, List, Optional, Set, Union

import httpx
from tenacity import (
    retry,
    retry_if_exception_type,
    stop_after_attempt,
    wait_exponential,
)

# ============================================================================
# LOGGING CONFIGURATION
# ============================================================================

# Create logs directory if it doesn't exist
LOGS_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "logs")
os.makedirs(LOGS_DIR, exist_ok=True)

# Configure audit trail logging
audit_logger = logging.getLogger("apex.audit")
audit_logger.setLevel(logging.INFO)

# File handler for audit trails
audit_file = os.path.join(LOGS_DIR, f"apex_audit_{datetime.now().strftime('%Y%m%d')}.log")
audit_handler = logging.FileHandler(audit_file, mode='a')
audit_handler.setLevel(logging.INFO)
audit_formatter = logging.Formatter(
    '%(asctime)s | %(levelname)s | %(name)s | %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
audit_handler.setFormatter(audit_formatter)
audit_logger.addHandler(audit_handler)

# Console handler for immediate feedback
console_handler = logging.StreamHandler()
console_handler.setLevel(logging.INFO)
console_handler.setFormatter(audit_formatter)

# Main logger
logger = logging.getLogger("apex.swarm")
logger.setLevel(logging.INFO)
logger.addHandler(audit_handler)
logger.addHandler(console_handler)

# ============================================================================
# CUSTOM EXCEPTIONS
# ============================================================================

class OllamaConnectionError(Exception):
    """Raised when Ollama is not running or unreachable."""
    pass

class AgentProcessingError(Exception):
    """Raised when an agent fails to process a request."""
    pass

class InvalidModelError(Exception):
    """Raised when the specified model is not available."""
    pass

# ============================================================================
# DATA MODELS
# ============================================================================

class RiskLevel(str, Enum):
    LOW = "low"
    MODERATE = "moderate"
    HIGH = "high"
    CRITICAL = "critical"

class EscalationState(str, Enum):
    NORMAL = "normal"
    WATCH = "watch"
    ESCALATED = "escalated"
    URGENT = "urgent"

class Momentum(str, Enum):
    ACCELERATING = "accelerating"
    STABLE = "stable"
    COOLING = "cooling"

@dataclass
class SignalEvent:
    """Base signal event structure."""
    id: str
    source: str
    area: str
    magnitude: float
    direction: str  # "up", "down", "volatile"
    velocity: float
    trust: float
    created_at: str
    note: str

@dataclass
class Recommendation:
    """Recommendation structure matching frontend types."""
    id: str
    title: str
    summary: str
    reasoning: str
    type: str
    area: str
    suggested_actions: List[str]
    forecast_outcome: str
    urgency: str
    escalation_state: EscalationState
    confidence: float
    risk_level: RiskLevel
    created_at: str
    agent_source: str

@dataclass
class MarketSignal:
    """Market intelligence signal."""
    id: str
    signal_type: str  # "anomaly", "pricing", "undervalued", "migration", "investor"
    title: str
    insight: str
    confidence: float
    action: str
    district: Optional[str] = None
    timestamp: str = field(default_factory=lambda: datetime.now().isoformat())

@dataclass
class LeadScore:
    """Lead intelligence scoring result."""
    id: str
    buyer_name: str
    segment: str
    intent_score: float
    prestige_score: float
    probability_to_close: float
    ai_priority_level: str
    emotional_sentiment: float
    recommended_action: str
    timestamp: str = field(default_factory=lambda: datetime.now().isoformat())

@dataclass
class RiskAlert:
    """Risk sentinel alert."""
    id: str
    alert_type: str  # "brand_safety", "anomaly", "competitor_threat", "market_volatility"
    severity: RiskLevel
    title: str
    description: str
    affected_areas: List[str]
    mitigation_strategy: str
    timestamp: str = field(default_factory=lambda: datetime.now().isoformat())

@dataclass
class AuthorityMetrics:
    """Founder authority metrics."""
    id: str
    narrative_velocity: float
    trust_lift: float
    conversion_lift: float
    investor_confidence: float
    prestige_amplification: float
    voice_share: float
    competitor_voice_share: float
    authority_radar: Dict[str, float]
    timestamp: str = field(default_factory=lambda: datetime.now().isoformat())

@dataclass
class SimulationResult:
    """Scenario simulator output."""
    id: str
    headline: str
    verdict: str  # "bullish", "cautious", "bearish"
    confidence: float
    top_risk: str
    top_opportunity: str
    recommendations: List[str]
    executive_summary: str
    forecast_trajectory: List[Dict[str, Any]]
    competitor_responses: List[Dict[str, Any]]
    timestamp: str = field(default_factory=lambda: datetime.now().isoformat())

@dataclass
class SimulationControls:
    """Controls for scenario simulation."""
    founder_content: float = 50.0
    luxury_positioning: float = 50.0
    influencer_deployment: float = 50.0
    pr_activation: float = 50.0
    investor_messaging: float = 50.0
    geographic_expansion: float = 50.0
    pricing_change: float = 50.0
    narrative_framing: float = 50.0
    aggression: float = 50.0
    risk_tolerance: float = 50.0
    capital_allocation: float = 50.0
    influence_budget: float = 50.0
    timeline: str = "90d"

@dataclass
class SwarmMessage:
    """Message structure for inter-agent communication."""
    id: str
    sender: str
    recipient: Optional[str]  # None for broadcast
    message_type: str
    payload: Dict[str, Any]
    timestamp: str = field(default_factory=lambda: datetime.now().isoformat())

# ============================================================================
# OLLAMA CLIENT
# ============================================================================

class OllamaClient:
    """Client for interacting with Ollama LLM."""
    
    DEFAULT_HOST = "http://localhost:11434"
    DEFAULT_MODEL = "llama3.3:8b"
    
    # Per-agent model mapping for optimal performance
    AGENT_MODELS = {
        "market_intelligence": "llama3.3:8b",
        "lead_intelligence": "phi4:mini",
        "risk_sentinel": "gemma4:4b",
        "founder_authority": "llama3.3:8b",
        "scenario_simulator": "mistral:7b",
        "recommendation_engine": "qwen3:7b",
    }
    
    def __init__(
        self,
        host: Optional[str] = None,
        model: Optional[str] = None,
        timeout: float = 60.0
    ):
        self.host = host or os.getenv("OLLAMA_HOST", self.DEFAULT_HOST)
        self.model = model or os.getenv("OLLAMA_MODEL", self.DEFAULT_MODEL)
        self.timeout = timeout
        self.client = httpx.AsyncClient(timeout=timeout)
        self._available = False
        
        logger.info(f"OllamaClient initialized: host={self.host}, model={self.model}")
    
    async def check_connection(self) -> bool:
        """Check if Ollama is running and accessible."""
        try:
            response = await self.client.get(f"{self.host}/api/tags", timeout=5.0)
            self._available = response.status_code == 200
            return self._available
        except Exception as e:
            logger.warning(f"Ollama connection check failed: {e}")
            self._available = False
            return False
    
    async def list_models(self) -> List[str]:
        """List available models."""
        try:
            response = await self.client.get(f"{self.host}/api/tags")
            response.raise_for_status()
            data = response.json()
            return [m["name"] for m in data.get("models", [])]
        except Exception as e:
            logger.error(f"Failed to list models: {e}")
            raise OllamaConnectionError(f"Cannot connect to Ollama: {e}")
    
    @retry(
        retry=retry_if_exception_type((OllamaConnectionError, httpx.TimeoutException)),
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=10)
    )
    async def generate(
        self,
        prompt: str,
        system: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: int = 2000,
        stream: bool = False
    ) -> Union[str, AsyncGenerator[str, None]]:
        """Generate text using Ollama."""
        
        if not await self.check_connection():
            raise OllamaConnectionError(
                f"Ollama is not running at {self.host}. "
                "Please start Ollama or check the host configuration."
            )
        
        payload = {
            "model": self.model,
            "prompt": prompt,
            "temperature": temperature,
            "num_predict": max_tokens,
            "stream": stream
        }
        
        if system:
            payload["system"] = system
        
        try:
            if stream:
                return self._stream_generate(payload)
            else:
                response = await self.client.post(
                    f"{self.host}/api/generate",
                    json=payload,
                    timeout=self.timeout
                )
                response.raise_for_status()
                
                # Handle streaming response even when stream=False
                full_response = ""
                for line in response.text.strip().split('\n'):
                    if line:
                        try:
                            data = json.loads(line)
                            if "response" in data:
                                full_response += data["response"]
                        except json.JSONDecodeError:
                            continue
                
                return full_response
                
        except httpx.TimeoutException:
            logger.error(f"Ollama request timed out after {self.timeout}s")
            raise
        except httpx.ConnectError as e:
            logger.error(f"Cannot connect to Ollama: {e}")
            raise OllamaConnectionError(f"Connection failed: {e}")
        except Exception as e:
            logger.error(f"Unexpected error calling Ollama: {e}")
            raise AgentProcessingError(f"Generation failed: {e}")
    
    async def _stream_generate(
        self,
        payload: Dict[str, Any]
    ) -> AsyncGenerator[str, None]:
        """Stream generate text from Ollama."""
        async with self.client.stream(
            "POST",
            f"{self.host}/api/generate",
            json=payload,
            timeout=self.timeout
        ) as response:
            response.raise_for_status()
            
            async for line in response.aiter_lines():
                if line:
                    try:
                        data = json.loads(line)
                        if "response" in data:
                            yield data["response"]
                        if data.get("done", False):
                            break
                    except json.JSONDecodeError:
                        continue
    
    async def close(self):
        """Close the HTTP client."""
        await self.client.aclose()

# ============================================================================
# BASE AGENT CLASS
# ============================================================================

class BaseAgent(ABC):
    """Base class for all APEX agents."""
    
    def __init__(
        self,
        name: str,
        ollama_client: OllamaClient,
        message_bus: Optional[asyncio.Queue] = None
    ):
        self.name = name
        self.client = ollama_client
        self.message_bus = message_bus
        self.is_running = False
        self.task: Optional[asyncio.Task] = None
        self.message_handlers: Dict[str, Callable] = {}
        
        logger.info(f"Agent '{name}' initialized")
    
    def register_handler(self, message_type: str, handler: Callable):
        """Register a handler for a specific message type."""
        self.message_handlers[message_type] = handler
        logger.debug(f"Agent '{self.name}' registered handler for '{message_type}'")
    
    async def start(self):
        """Start the agent's message processing loop."""
        if self.is_running:
            return
        
        self.is_running = True
        self.task = asyncio.create_task(self._process_messages())
        logger.info(f"Agent '{self.name}' started")
        audit_logger.info(f"AGENT_START | agent={self.name}")
    
    async def stop(self):
        """Stop the agent."""
        self.is_running = False
        if self.task:
            self.task.cancel()
            try:
                await self.task
            except asyncio.CancelledError:
                pass
        logger.info(f"Agent '{self.name}' stopped")
        audit_logger.info(f"AGENT_STOP | agent={self.name}")
    
    async def _process_messages(self):
        """Process incoming messages from the message bus."""
        if not self.message_bus:
            return
        
        while self.is_running:
            try:
                message: SwarmMessage = await asyncio.wait_for(
                    self.message_bus.get(),
                    timeout=1.0
                )
                
                # Check if message is for this agent
                if message.recipient and message.recipient != self.name:
                    continue
                
                # Handle the message
                handler = self.message_handlers.get(message.message_type)
                if handler:
                    try:
                        await handler(message)
                    except Exception as e:
                        logger.error(f"Agent '{self.name}' failed to handle message: {e}")
                
            except asyncio.TimeoutError:
                continue
            except Exception as e:
                logger.error(f"Agent '{self.name}' message processing error: {e}")
    
    async def send_message(
        self,
        message_type: str,
        payload: Dict[str, Any],
        recipient: Optional[str] = None
    ):
        """Send a message to the swarm."""
        if self.message_bus:
            message = SwarmMessage(
                id=str(uuid.uuid4()),
                sender=self.name,
                recipient=recipient,
                message_type=message_type,
                payload=payload
            )
            await self.message_bus.put(message)
            audit_logger.info(
                f"MESSAGE_SENT | from={self.name} | to={recipient or 'broadcast'} | type={message_type}"
            )
    
    @abstractmethod
    async def process(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Process input data and return results."""
        pass
    
    async def health_check(self) -> Dict[str, Any]:
        """Return agent health status."""
        return {
            "agent": self.name,
            "status": "healthy" if self.is_running else "stopped",
            "timestamp": datetime.now().isoformat()
        }

# ============================================================================
# AGENT IMPLEMENTATIONS
# ============================================================================

class MarketIntelligenceAgent(BaseAgent):
    """
    Market Intelligence Agent
    Analyzes market dynamics, competitor movements, and generates trading signals.
    """
    
    SYSTEM_PROMPT = """You are the APEX Market Intelligence Agent specializing in Dubai luxury real estate.
Your expertise includes:
- District-level demand analysis (Palm Jumeirah, DIFC, Jumeirah Bay, Emirates Hills)
- Competitor pricing and launch tracking
- Capital flow patterns and investor sentiment
- Luxury market momentum indicators

Generate concise, actionable market intelligence in JSON format."""
    
    async def process(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Process market data and generate intelligence signals."""
        
        district = data.get("district", "Dubai Marina")
        timeframe = data.get("timeframe", "30d")
        
        prompt = f"""Analyze the luxury real estate market for {district} over the next {timeframe}.

Generate 3-5 market signals covering:
1. Demand intensity and buyer concentration
2. Luxury momentum indicators
3. Capital inflow patterns
4. Inventory pressure signals
5. Competitor activity

Respond with valid JSON:
{{
  "signals": [
    {{
      "type": "anomaly|pricing|undervalued|migration|investor",
      "title": "Signal title",
      "insight": "Detailed insight (2-3 sentences)",
      "confidence": 0.85,
      "action": "Recommended action"
    }}
  ],
  "market_summary": "Overall market assessment (1 paragraph)",
  "risk_level": "low|moderate|high"
}}"""
        
        try:
            response = await self.client.generate(
                prompt=prompt,
                system=self.SYSTEM_PROMPT,
                temperature=0.4,
                max_tokens=1500
            )
            
            # Parse JSON response
            try:
                result = json.loads(response)
            except json.JSONDecodeError:
                # Try to extract JSON from markdown code block
                import re
                json_match = re.search(r'```(?:json)?\s*(\{.*?\})\s*```', response, re.DOTALL)
                if json_match:
                    result = json.loads(json_match.group(1))
                else:
                    raise AgentProcessingError("Failed to parse agent response as JSON")
            
            # Add metadata
            result["agent"] = self.name
            result["timestamp"] = datetime.now().isoformat()
            result["input_district"] = district
            
            audit_logger.info(
                f"AGENT_PROCESS | agent={self.name} | district={district} | signals={len(result.get('signals', []))}"
            )
            
            return result
            
        except Exception as e:
            logger.error(f"MarketIntelligenceAgent processing error: {e}")
            audit_logger.error(f"AGENT_ERROR | agent={self.name} | error={str(e)}")
            
            # Return fallback response
            return {
                "agent": self.name,
                "timestamp": datetime.now().isoformat(),
                "error": str(e),
                "signals": [],
                "market_summary": "Analysis temporarily unavailable",
                "risk_level": "moderate"
            }


class LeadIntelligenceAgent(BaseAgent):
    """
    Lead Intelligence Agent
    Scores leads, analyzes buyer intent, and segments VIP prospects.
    """
    
    SYSTEM_PROMPT = """You are the APEX Lead Intelligence Agent for luxury real estate.
You specialize in:
- High-net-worth individual (HNWI) lead scoring
- Buyer intent analysis and conversion prediction
- VIP segmentation (Sovereign Capital, Legacy Wealth, Prestige Lifestyle, etc.)
- Emotional sentiment analysis from interactions
- Response latency and conversation quality assessment

Provide institutional-grade lead intelligence in JSON format."""
    
    SEGMENTS = [
        "Sovereign Capital",
        "Legacy Wealth",
        "Prestige Lifestyle",
        "Yield Strategists",
        "Relocation Elites"
    ]
    
    async def process(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Process lead data and generate intelligence."""
        
        lead_name = data.get("lead_name", "Prospect")
        interactions = data.get("interactions", [])
        source = data.get("source", "organic")
        
        prompt = f"""Analyze this luxury real estate lead:
Name: {lead_name}
Source: {source}
Interaction History: {json.dumps(interactions) if interactions else "Limited data"}

Generate a comprehensive lead score including:
1. Intent score (0-100) - likelihood to purchase
2. Prestige score (0-100) - alignment with luxury positioning
3. Probability to close (0-100)
4. Segment classification
5. Emotional sentiment (-1 to 1)
6. AI priority level (critical|high|medium|watch)
7. Recommended next action

Respond with valid JSON:
{{
  "lead_name": "{lead_name}",
  "intent_score": 78.5,
  "prestige_score": 85.0,
  "probability_to_close": 65.0,
  "segment": "Sovereign Capital|Legacy Wealth|Prestige Lifestyle|Yield Strategists|Relocation Elites",
  "emotional_sentiment": 0.72,
  "priority_level": "high",
  "recommended_action": "Specific action recommendation",
  "conversation_quality": 82,
  "trust_alignment": 0.78,
  "urgency_momentum": "accelerating|stable|cooling"
}}"""
        
        try:
            response = await self.client.generate(
                prompt=prompt,
                system=self.SYSTEM_PROMPT,
                temperature=0.5,
                max_tokens=1200
            )
            
            # Parse JSON response
            try:
                result = json.loads(response)
            except json.JSONDecodeError:
                import re
                json_match = re.search(r'```(?:json)?\s*(\{.*?\})\s*```', response, re.DOTALL)
                if json_match:
                    result = json.loads(json_match.group(1))
                else:
                    raise AgentProcessingError("Failed to parse agent response as JSON")
            
            result["agent"] = self.name
            result["timestamp"] = datetime.now().isoformat()
            result["id"] = str(uuid.uuid4())
            
            audit_logger.info(
                f"AGENT_PROCESS | agent={self.name} | lead={lead_name} | priority={result.get('priority_level', 'unknown')}"
            )
            
            return result
            
        except Exception as e:
            logger.error(f"LeadIntelligenceAgent processing error: {e}")
            audit_logger.error(f"AGENT_ERROR | agent={self.name} | error={str(e)}")
            
            return {
                "agent": self.name,
                "timestamp": datetime.now().isoformat(),
                "id": str(uuid.uuid4()),
                "lead_name": lead_name,
                "error": str(e),
                "intent_score": 50.0,
                "prestige_score": 50.0,
                "probability_to_close": 30.0,
                "segment": "Prestige Lifestyle",
                "priority_level": "medium",
                "recommended_action": "Schedule discovery call"
            }


class RiskSentinelAgent(BaseAgent):
    """
    Risk Sentinel Agent
    Monitors for brand safety issues, anomalies, and threats.
    """
    
    SYSTEM_PROMPT = """You are the APEX Risk Sentinel Agent for luxury real estate operations.
Your role is to:
- Monitor brand safety and reputation risks
- Detect market anomalies and volatility signals
- Track competitor threats and aggressive moves
- Assess prestige volatility and trust erosion
- Generate early warning alerts

Provide risk assessments in structured JSON format with severity ratings."""
    
    async def process(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Process data for risk analysis."""
        
        context = data.get("context", "general monitoring")
        market_data = data.get("market_data", {})
        brand_mentions = data.get("brand_mentions", [])
        
        prompt = f"""Analyze risk factors for luxury real estate operations:
Context: {context}
Market Indicators: {json.dumps(market_data)}
Brand Mentions: {len(brand_mentions)} tracked

Generate a risk assessment including:
1. Brand safety risks
2. Market volatility indicators  
3. Competitor threat analysis
4. Prestige/reputation risks
5. Recommended mitigations

Respond with valid JSON:
{{
  "alerts": [
    {{
      "type": "brand_safety|anomaly|competitor_threat|market_volatility|prestige_risk",
      "severity": "low|moderate|high|critical",
      "title": "Alert title",
      "description": "Detailed description",
      "affected_areas": ["area1", "area2"],
      "mitigation_strategy": "Specific mitigation approach"
    }}
  ],
  "overall_risk_level": "low|moderate|high|critical",
  "risk_summary": "Executive summary of risk landscape"
}}"""
        
        try:
            response = await self.client.generate(
                prompt=prompt,
                system=self.SYSTEM_PROMPT,
                temperature=0.3,
                max_tokens=1500
            )
            
            try:
                result = json.loads(response)
            except json.JSONDecodeError:
                import re
                json_match = re.search(r'```(?:json)?\s*(\{.*?\})\s*```', response, re.DOTALL)
                if json_match:
                    result = json.loads(json_match.group(1))
                else:
                    result = {"alerts": [], "overall_risk_level": "moderate", "risk_summary": "Analysis pending"}
            
            result["agent"] = self.name
            result["timestamp"] = datetime.now().isoformat()
            
            # Log critical alerts
            critical_count = sum(1 for a in result.get("alerts", []) if a.get("severity") == "critical")
            if critical_count > 0:
                audit_logger.warning(f"RISK_ALERT | agent={self.name} | critical_alerts={critical_count}")
            
            audit_logger.info(
                f"AGENT_PROCESS | agent={self.name} | alerts={len(result.get('alerts', []))} | level={result.get('overall_risk_level', 'unknown')}"
            )
            
            return result
            
        except Exception as e:
            logger.error(f"RiskSentinelAgent processing error: {e}")
            audit_logger.error(f"AGENT_ERROR | agent={self.name} | error={str(e)}")
            
            return {
                "agent": self.name,
                "timestamp": datetime.now().isoformat(),
                "error": str(e),
                "alerts": [],
                "overall_risk_level": "moderate",
                "risk_summary": "Risk analysis temporarily unavailable"
            }


class FounderAuthorityAgent(BaseAgent):
    """
    Founder Authority Agent
    Analyzes founder authority positioning, narrative intelligence, and trust metrics.
    """
    
    SYSTEM_PROMPT = """You are the APEX Founder Authority Agent for luxury real estate executives.
Your expertise includes:
- Founder authority positioning and thought leadership analysis
- Narrative intelligence and message velocity tracking
- Trust index measurement and reputation assessment
- Voice share analysis vs competitors
- Investor confidence signaling
- Prestige amplification strategies
- Authority radar metrics across dimensions

Provide executive-grade authority intelligence in JSON format."""
    
    async def process(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Process founder authority data."""
        
        founder_name = data.get("founder_name", "Executive")
        content_pieces = data.get("content_pieces", [])
        competitor_data = data.get("competitor_data", {})
        time_period = data.get("time_period", "30d")
        
        prompt = f"""Analyze founder authority positioning for {founder_name} over {time_period}.

Content Published: {len(content_pieces)} pieces
Competitor Context: {json.dumps(competitor_data) if competitor_data else "Baseline comparison"}

Generate comprehensive authority metrics:
1. Narrative velocity (0-100) - speed of message spread
2. Trust lift (0-100) - trust index improvement
3. Conversion lift (0-100) - conversion rate impact
4. Investor confidence (0-100) - investor sentiment
5. Prestige amplification (0-100) - brand prestige multiplier
6. Voice share vs competitors
7. Authority radar scores across dimensions
8. Strategic recommendations

Respond with valid JSON:
{{
  "founder_name": "{founder_name}",
  "narrative_velocity": 75.5,
  "trust_lift": 82.0,
  "conversion_lift": 68.5,
  "investor_confidence": 88.0,
  "prestige_amplification": 72.5,
  "voice_share": {{
    "founder": 35.0,
    "competitor_avg": 65.0,
    "trend": "growing|stable|declining"
  }},
  "authority_radar": {{
    "thought_leadership": 78,
    "industry_influence": 72,
    "media_presence": 65,
    "investor_trust": 85,
    "market_authority": 70,
    "narrative_control": 68
  }},
  "recommendations": [
    {{
      "action": "Specific action",
      "impact": "Expected impact",
      "priority": "critical|high|medium"
    }}
  ],
  "momentum": "accelerating|stable|cooling"
}}"""
        
        try:
            response = await self.client.generate(
                prompt=prompt,
                system=self.SYSTEM_PROMPT,
                temperature=0.5,
                max_tokens=1800
            )
            
            try:
                result = json.loads(response)
            except json.JSONDecodeError:
                import re
                json_match = re.search(r'```(?:json)?\s*(\{.*?\})\s*```', response, re.DOTALL)
                if json_match:
                    result = json.loads(json_match.group(1))
                else:
                    raise AgentProcessingError("Failed to parse agent response as JSON")
            
            result["agent"] = self.name
            result["timestamp"] = datetime.now().isoformat()
            result["id"] = str(uuid.uuid4())
            
            audit_logger.info(
                f"AGENT_PROCESS | agent={self.name} | founder={founder_name} | velocity={result.get('narrative_velocity', 0)}"
            )
            
            return result
            
        except Exception as e:
            logger.error(f"FounderAuthorityAgent processing error: {e}")
            audit_logger.error(f"AGENT_ERROR | agent={self.name} | error={str(e)}")
            
            return {
                "agent": self.name,
                "timestamp": datetime.now().isoformat(),
                "id": str(uuid.uuid4()),
                "founder_name": founder_name,
                "error": str(e),
                "narrative_velocity": 50.0,
                "trust_lift": 50.0,
                "investor_confidence": 50.0,
                "voice_share": {"founder": 25.0, "competitor_avg": 75.0, "trend": "stable"},
                "authority_radar": {
                    "thought_leadership": 50,
                    "industry_influence": 50,
                    "media_presence": 50,
                    "investor_trust": 50,
                    "market_authority": 50,
                    "narrative_control": 50
                },
                "momentum": "stable"
            }


class ScenarioSimulatorAgent(BaseAgent):
    """
    Scenario Simulator Agent
    Runs strategic simulations and models competitor responses.
    """
    
    SYSTEM_PROMPT = """You are the APEX Scenario Simulator Agent for luxury real estate strategy.
Your capabilities include:
- Multi-variable strategic scenario modeling
- Competitor response prediction
- Revenue and prestige forecasting
- Risk-adjusted outcome simulation
- Timeline-based signal generation
- Executive-grade strategic recommendations

Provide institutional-grade simulation results in JSON format."""
    
    async def process(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Process simulation parameters and generate forecast."""
        
        controls = SimulationControls(**data.get("controls", {}))
        
        prompt = f"""Run a strategic scenario simulation with these parameters:

CONTROLS:
- Founder Content: {controls.founder_content}/100
- Luxury Positioning: {controls.luxury_positioning}/100
- Influencer Deployment: {controls.influencer_deployment}/100
- PR Activation: {controls.pr_activation}/100
- Investor Messaging: {controls.investor_messaging}/100
- Geographic Expansion: {controls.geographic_expansion}/100
- Pricing Change Aggression: {controls.pricing_change}/100
- Narrative Framing: {controls.narrative_framing}/100
- Competitive Aggression: {controls.aggression}/100
- Risk Tolerance: {controls.risk_tolerance}/100
- Capital Allocation: {controls.capital_allocation}/100
- Influence Budget: {controls.influence_budget}/100
- Timeline: {controls.timeline}

Generate comprehensive simulation results:
1. Strategic headline and verdict
2. Confidence score
3. Top risk and opportunity
4. Actionable recommendations
5. Forecast trajectory over timeline
6. Competitor response predictions

Respond with valid JSON:
{{
  "headline": "One-sentence strategic summary",
  "verdict": "bullish|cautious|bearish",
  "confidence": 78.5,
  "top_risk": "Primary risk description",
  "top_opportunity": "Best opportunity description",
  "recommendations": ["Action 1", "Action 2", "Action 3"],
  "executive_summary": "2-3 sentence executive brief",
  "forecast_trajectory": [
    {{
      "period": "week1|month1|quarter1|etc",
      "revenue": 100.5,
      "prestige": 78.5,
      "trust": 82.0,
      "influence": 75.0,
      "market_penetration": 12.5,
      "investor_confidence": 85.0
    }}
  ],
  "competitor_responses": [
    {{
      "vector": "Response type",
      "probability": 0.75,
      "severity": "low|medium|high",
      "implication": "Strategic implication"
    }}
  ],
  "outcome_metrics": {{
    "revenue_projection_m": 150.5,
    "prestige_volatility": 15.5,
    "hnwi_conversion": 8.5,
    "investor_sentiment": 82.0,
    "authority_evolution": 78.5
  }}
}}"""
        
        try:
            response = await self.client.generate(
                prompt=prompt,
                system=self.SYSTEM_PROMPT,
                temperature=0.6,
                max_tokens=2500
            )
            
            try:
                result = json.loads(response)
            except json.JSONDecodeError:
                import re
                json_match = re.search(r'```(?:json)?\s*(\{.*?\})\s*```', response, re.DOTALL)
                if json_match:
                    result = json.loads(json_match.group(1))
                else:
                    raise AgentProcessingError("Failed to parse agent response as JSON")
            
            result["agent"] = self.name
            result["timestamp"] = datetime.now().isoformat()
            result["id"] = str(uuid.uuid4())
            result["input_controls"] = controls.__dict__
            
            audit_logger.info(
                f"AGENT_PROCESS | agent={self.name} | verdict={result.get('verdict', 'unknown')} | confidence={result.get('confidence', 0)}"
            )
            
            return result
            
        except Exception as e:
            logger.error(f"ScenarioSimulatorAgent processing error: {e}")
            audit_logger.error(f"AGENT_ERROR | agent={self.name} | error={str(e)}")
            
            return {
                "agent": self.name,
                "timestamp": datetime.now().isoformat(),
                "id": str(uuid.uuid4()),
                "error": str(e),
                "headline": "Simulation analysis temporarily unavailable",
                "verdict": "cautious",
                "confidence": 50.0,
                "top_risk": "Analysis error - review inputs",
                "top_opportunity": "Retry simulation with adjusted parameters",
                "recommendations": ["Check system status", "Verify input parameters"],
                "executive_summary": "Simulation engine encountered an error. Please retry.",
                "forecast_trajectory": [],
                "competitor_responses": [],
                "outcome_metrics": {}
            }


class AIRecommendationEngine(BaseAgent):
    """
    AI Recommendation Engine
    Orchestrates across all agents, scores recommendations, and manages priorities.
    """
    
    SYSTEM_PROMPT = """You are the APEX AI Recommendation Engine - the central orchestrator.
You synthesize inputs from all agents to generate prioritized, actionable recommendations.
Your capabilities:
- Cross-agent signal aggregation and weighting
- Recommendation priority scoring
- Conflict resolution between competing recommendations
- Time-sensitivity assessment
- Strategic impact quantification
- Executive decision support

Provide prioritized recommendations with full supporting evidence."""
    
    def __init__(
        self,
        ollama_client: OllamaClient,
        message_bus: Optional[asyncio.Queue] = None,
        agents: Optional[Dict[str, BaseAgent]] = None
    ):
        super().__init__("AI Recommendation Engine", ollama_client, message_bus)
        self.agents = agents or {}
        self.recommendation_history: List[Recommendation] = []
        self.signal_buffer: List[SignalEvent] = []
    
    def register_agent(self, name: str, agent: BaseAgent):
        """Register an agent for orchestration."""
        self.agents[name] = agent
        logger.info(f"RecommendationEngine registered agent: {name}")
    
    async def process(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Process cross-agent signals and generate recommendations."""
        
        domain = data.get("domain", "home")
        context = data.get("context", "")
        agent_inputs = data.get("agent_inputs", {})
        
        # Build prompt from agent inputs
        agent_summaries = []
        for agent_name, agent_data in agent_inputs.items():
            agent_summaries.append(f"{agent_name}: {json.dumps(agent_data, default=str)[:500]}")
        
        prompt = f"""Generate strategic recommendations for APEX Command Center.

DOMAIN: {domain}
CONTEXT: {context}

AGENT INPUTS:
{chr(10).join(agent_summaries) if agent_summaries else "Cross-domain strategic synthesis"}

Generate 4 high-priority recommendations:
1. Each must be specific and actionable
2. Include confidence score (60-97)
3. Assess risk level (low|medium|high)
4. Define expected outcome/uplift
5. Assign action owner
6. Set timeline

Respond with valid JSON:
{{
  "recommendations": [
    {{
      "id": "rec-001",
      "title": "Action-oriented title (max 8 words)",
      "summary": "Strategic rationale (2 sentences)",
      "reasoning": "Detailed reasoning",
      "type": "founder-narrative|luxury-positioning|influence-deployment|hnwi-optimization|prestige-mitigation|investor-messaging|creator-partnership|revenue-acceleration|competitive-response|strategic-timing",
      "area": "luxury-market|founder-authority|influence-system|lead-intelligence|prestige-stability|revenue-acceleration|market-positioning|executive-risk",
      "suggested_actions": ["Action 1", "Action 2"],
      "forecast_outcome": "Expected outcome description",
      "urgency": "immediate|short-term|medium-term",
      "escalation_state": "normal|watch|escalated|urgent",
      "confidence": 85.5,
      "risk_level": "low|moderate|high|critical",
      "strategic_impact": 88.0,
      "revenue_impact": 75.5,
      "time_sensitivity": "high",
      "execution_complexity": "medium",
      "outcome_window": "30 days",
      "action_owner": "Founder|Marketing|Sales|Strategy|PR Team"
    }}
  ],
  "orchestration_summary": "Brief synthesis of cross-agent intelligence"
}}"""
        
        try:
            response = await self.client.generate(
                prompt=prompt,
                system=self.SYSTEM_PROMPT,
                temperature=0.5,
                max_tokens=2500
            )
            
            try:
                result = json.loads(response)
            except json.JSONDecodeError:
                import re
                json_match = re.search(r'```(?:json)?\s*(\{.*?\})\s*```', response, re.DOTALL)
                if json_match:
                    result = json.loads(json_match.group(1))
                else:
                    raise AgentProcessingError("Failed to parse agent response as JSON")
            
            # Add metadata and process recommendations
            result["agent"] = self.name
            result["timestamp"] = datetime.now().isoformat()
            
            # Calculate priority index for each recommendation
            for rec in result.get("recommendations", []):
                confidence = rec.get("confidence", 50)
                strategic_impact = rec.get("strategic_impact", 50)
                urgency_map = {"immediate": 1.5, "short-term": 1.2, "medium-term": 1.0}
                urgency = urgency_map.get(rec.get("urgency", "medium-term"), 1.0)
                
                rec["priority_index"] = round((confidence * 0.3 + strategic_impact * 0.5) * urgency, 2)
                rec["created_at"] = datetime.now().isoformat()
            
            # Sort by priority index
            result["recommendations"].sort(key=lambda x: x.get("priority_index", 0), reverse=True)
            
            audit_logger.info(
                f"AGENT_PROCESS | agent={self.name} | domain={domain} | recommendations={len(result.get('recommendations', []))}"
            )
            
            return result
            
        except Exception as e:
            logger.error(f"AIRecommendationEngine processing error: {e}")
            audit_logger.error(f"AGENT_ERROR | agent={self.name} | error={str(e)}")
            
            return {
                "agent": self.name,
                "timestamp": datetime.now().isoformat(),
                "error": str(e),
                "recommendations": [],
                "orchestration_summary": "Recommendation engine temporarily unavailable"
            }
    
    async def coordinate_agents(self, request: Dict[str, Any]) -> Dict[str, Any]:
        """Coordinate multiple agents for a complex request."""
        
        audit_logger.info(f"COORDINATION_START | request_type={request.get('type', 'unknown')}")
        
        agent_tasks = []
        for name, agent in self.agents.items():
            if name != self.name:  # Don't recurse into self
                task = agent.process(request.get("data", {}))
                agent_tasks.append((name, task))
        
        # Gather results from all agents
        agent_results = {}
        for name, task in agent_tasks:
            try:
                result = await asyncio.wait_for(task, timeout=30.0)
                agent_results[name] = result
            except asyncio.TimeoutError:
                logger.warning(f"Agent {name} timed out")
                agent_results[name] = {"error": "Timeout", "agent": name}
            except Exception as e:
                logger.error(f"Agent {name} failed: {e}")
                agent_results[name] = {"error": str(e), "agent": name}
        
        # Generate synthesized recommendations
        synthesis_request = {
            "domain": request.get("domain", "home"),
            "context": request.get("context", ""),
            "agent_inputs": agent_results
        }
        
        recommendations = await self.process(synthesis_request)
        
        audit_logger.info(f"COORDINATION_COMPLETE | agents={len(agent_results)} | recommendations={len(recommendations.get('recommendations', []))}")
        
        return {
            "agent_results": agent_results,
            "recommendations": recommendations,
            "coordinated_at": datetime.now().isoformat()
        }

# ============================================================================
# SWARM ORCHESTRATOR
# ============================================================================

class ApexSwarm:
    """
    Main orchestrator for the APEX Swarm Intelligence Engine.
    Manages all agents, handles WebSocket streaming, and provides health monitoring.
    """
    
    def __init__(
        self,
        ollama_host: Optional[str] = None,
        ollama_model: Optional[str] = None
    ):
        self.host = ollama_host or "http://localhost:11434"
        self.default_model = ollama_model or "llama3.3:8b"
        self.client = OllamaClient(host=self.host, model=self.default_model)
        self.message_bus: asyncio.Queue = asyncio.Queue(maxsize=1000)
        self.agents: Dict[str, BaseAgent] = {}
        self.recommendation_engine: Optional[AIRecommendationEngine] = None
        self._streaming_clients: Set[asyncio.Queue] = set()
        self._running = False
        
        logger.info("ApexSwarm initialized")
    
    async def initialize(self):
        """Initialize the swarm and all agents."""
        
        # Check Ollama connection
        if not await self.client.check_connection():
            logger.warning("Ollama not available - agents will run in fallback mode")
            audit_logger.warning("SWARM_INIT | ollama_available=false")
        else:
            models = await self.client.list_models()
            logger.info(f"Ollama connected. Available models: {models}")
            audit_logger.info(f"SWARM_INIT | ollama_available=true | models={len(models)}")
        
        # Create agents with optimized models
        self.agents["market_intelligence"] = MarketIntelligenceAgent(
            "Market Intelligence Agent",
            OllamaClient(host=self.host, model="llama3.3:8b"),
            self.message_bus
        )
        
        self.agents["lead_intelligence"] = LeadIntelligenceAgent(
            "Lead Intelligence Agent",
            OllamaClient(host=self.host, model="phi4:mini"),
            self.message_bus
        )
        
        self.agents["risk_sentinel"] = RiskSentinelAgent(
            "Risk Sentinel",
            OllamaClient(host=self.host, model="gemma4:4b"),
            self.message_bus
        )
        
        self.agents["founder_authority"] = FounderAuthorityAgent(
            "Founder Authority Agent",
            OllamaClient(host=self.host, model="llama3.3:8b"),
            self.message_bus
        )
        
        self.agents["scenario_simulator"] = ScenarioSimulatorAgent(
            "Scenario Simulator Agent",
            OllamaClient(host=self.host, model="mistral:7b"),
            self.message_bus
        )
        
        # Create recommendation engine
        self.recommendation_engine = AIRecommendationEngine(
            OllamaClient(host=self.host, model="qwen3:7b"),
            self.message_bus,
            self.agents
        )
        self.agents["recommendation_engine"] = self.recommendation_engine
        
        # Register all agents with the engine
        for name, agent in self.agents.items():
            if name != "recommendation_engine":
                self.recommendation_engine.register_agent(name, agent)
        
        logger.info(f"Swarm initialized with {len(self.agents)} agents")
        audit_logger.info(f"SWARM_INIT | agents={list(self.agents.keys())}")
    
    async def start(self):
        """Start all agents."""
        self._running = True
        
        for name, agent in self.agents.items():
            await agent.start()
        
        # Start the streaming broadcaster
        asyncio.create_task(self._broadcast_loop())
        
        logger.info("ApexSwarm started")
        audit_logger.info("SWARM_START | status=running")
    
    async def stop(self):
        """Stop all agents."""
        self._running = False
        
        for name, agent in self.agents.items():
            await agent.stop()
        
        await self.client.close()
        
        logger.info("ApexSwarm stopped")
        audit_logger.info("SWARM_STOP | status=stopped")
    
    async def _broadcast_loop(self):
        """Background loop to broadcast updates to connected WebSocket clients."""
        while self._running:
            try:
                # Generate periodic updates
                await asyncio.sleep(5.0)
                
                if self._streaming_clients:
                    status_update = {
                        "type": "swarm_status",
                        "timestamp": datetime.now().isoformat(),
                        "agents": {name: await agent.health_check() for name, agent in self.agents.items()},
                        "connected_clients": len(self._streaming_clients)
                    }
                    
                    await self._broadcast(status_update)
                    
            except Exception as e:
                logger.error(f"Broadcast loop error: {e}")
    
    async def _broadcast(self, message: Dict[str, Any]):
        """Broadcast a message to all connected WebSocket clients."""
        disconnected = set()
        
        for client_queue in self._streaming_clients:
            try:
                await client_queue.put(message)
            except Exception:
                disconnected.add(client_queue)
        
        # Clean up disconnected clients
        self._streaming_clients -= disconnected
    
    def subscribe(self) -> asyncio.Queue:
        """Subscribe to real-time updates. Returns a queue for receiving messages."""
        queue: asyncio.Queue = asyncio.Queue(maxsize=100)
        self._streaming_clients.add(queue)
        logger.info(f"New streaming client subscribed. Total: {len(self._streaming_clients)}")
        return queue
    
    def unsubscribe(self, queue: asyncio.Queue):
        """Unsubscribe from real-time updates."""
        self._streaming_clients.discard(queue)
        logger.info(f"Streaming client unsubscribed. Total: {len(self._streaming_clients)}")
    
    async def process(
        self,
        agent_name: str,
        data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Process a request through a specific agent."""
        
        if agent_name not in self.agents:
            raise ValueError(f"Unknown agent: {agent_name}")
        
        audit_logger.info(f"SWARM_PROCESS | agent={agent_name}")
        
        result = await self.agents[agent_name].process(data)
        
        # Broadcast the result to streaming clients
        await self._broadcast({
            "type": "agent_result",
            "agent": agent_name,
            "timestamp": datetime.now().isoformat(),
            "data": result
        })
        
        return result
    
    async def coordinate(self, request: Dict[str, Any]) -> Dict[str, Any]:
        """Coordinate multiple agents for complex requests."""
        if not self.recommendation_engine:
            raise RuntimeError("Recommendation engine not initialized")
        
        return await self.recommendation_engine.coordinate_agents(request)
    
    async def health_check(self) -> Dict[str, Any]:
        """Return comprehensive health status."""
        ollama_status = await self.client.check_connection()
        
        return {
            "status": "healthy" if self._running else "stopped",
            "ollama_connected": ollama_status,
            "agents": {name: await agent.health_check() for name, agent in self.agents.items()},
            "streaming_clients": len(self._streaming_clients),
            "timestamp": datetime.now().isoformat()
        }

# ============================================================================
# MAIN ENTRY POINT
# ============================================================================

async def main():
    """Run the swarm in standalone mode for testing."""
    
    print("=" * 60)
    print("APEX Swarm Intelligence Engine - Standalone Test")
    print("=" * 60)
    
    # Initialize swarm
    swarm = ApexSwarm()
    await swarm.initialize()
    await swarm.start()
    
    try:
        # Test Market Intelligence Agent
        print("\n--- Testing Market Intelligence Agent ---")
        market_result = await swarm.process("market_intelligence", {
            "district": "Palm Jumeirah",
            "timeframe": "30d"
        })
        print(f"Signals generated: {len(market_result.get('signals', []))}")
        
        # Test Lead Intelligence Agent
        print("\n--- Testing Lead Intelligence Agent ---")
        lead_result = await swarm.process("lead_intelligence", {
            "lead_name": "Ahmed Al-Rashid",
            "source": "referral",
            "interactions": [
                {"type": "inquiry", "channel": "whatsapp", "sentiment": "positive"}
            ]
        })
        print(f"Lead priority: {lead_result.get('priority_level', 'unknown')}")
        
        # Test Founder Authority Agent
        print("\n--- Testing Founder Authority Agent ---")
        founder_result = await swarm.process("founder_authority", {
            "founder_name": "Karim Farid",
            "content_pieces": ["Market outlook Q2", "Investment strategy guide"],
            "time_period": "30d"
        })
        print(f"Narrative velocity: {founder_result.get('narrative_velocity', 0)}")
        
        # Test Scenario Simulator
        print("\n--- Testing Scenario Simulator Agent ---")
        scenario_result = await swarm.process("scenario_simulator", {
            "controls": {
                "founder_content": 75,
                "luxury_positioning": 80,
                "influencer_deployment": 60,
                "aggression": 50,
                "risk_tolerance": 65,
                "timeline": "90d"
            }
        })
        print(f"Verdict: {scenario_result.get('verdict', 'unknown')}")
        print(f"Confidence: {scenario_result.get('confidence', 0)}")
        
        # Test Risk Sentinel
        print("\n--- Testing Risk Sentinel Agent ---")
        risk_result = await swarm.process("risk_sentinel", {
            "context": "Q2 market entry campaign",
            "market_data": {"volatility_index": 0.25, "competitor_launches": 2}
        })
        print(f"Overall risk level: {risk_result.get('overall_risk_level', 'unknown')}")
        print(f"Alerts: {len(risk_result.get('alerts', []))}")
        
        print("\n--- All Tests Complete ---")
        
        # Keep running for a bit to show streaming
        print("\nStreaming updates for 10 seconds...")
        await asyncio.sleep(10)
        
    except Exception as e:
        logger.error(f"Test failed: {e}")
        raise
    
    finally:
        await swarm.stop()
        print("\nSwarm stopped.")

if __name__ == "__main__":
    asyncio.run(main())

# ============================================================================
# AGENT MODEL CONFIGURATION
# ============================================================================

AGENT_MODELS = {
    "market_intelligence": "llama3.3:8b",
    "lead_intelligence": "phi4:mini",
    "risk_sentinel": "gemma4:4b",
    "founder_authority": "llama3.3:8b",
    "scenario_simulator": "mistral:7b",
    "recommendation_engine": "qwen3:7b",
}

DEFAULT_MODEL = "llama3.3:8b"