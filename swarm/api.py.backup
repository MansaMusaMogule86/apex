"""
APEX Swarm API Bridge
=====================
FastAPI-based bridge providing REST and WebSocket endpoints for the APEX Swarm.

Endpoints:
- REST API for agent queries and commands
- WebSocket for real-time streaming updates
- Health checks and monitoring
- CORS enabled for Next.js frontend integration

Author: APEX Intelligence Team
Created: 2026-05-15
"""

import asyncio
import json
import logging
import os
import sys
from contextlib import asynccontextmanager
from datetime import datetime
from typing import Any, AsyncGenerator, Dict, List, Optional, Set

from fastapi import FastAPI, HTTPException, Query, WebSocket, WebSocketDisconnect, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse
from pydantic import BaseModel, Field

# Add the swarm directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from apex_ollama import (
    ApexSwarm,
    OllamaConnectionError,
    AgentProcessingError,
    AGENT_MODELS,
    DEFAULT_MODEL,
    logger as swarm_logger,
    audit_logger,
)

# ============================================================================
# LOGGING CONFIGURATION
# ============================================================================

LOGS_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "logs")
os.makedirs(LOGS_DIR, exist_ok=True)

# API-specific logger
api_logger = logging.getLogger("apex.api")
api_logger.setLevel(logging.INFO)

# File handler for API logs
api_log_file = os.path.join(LOGS_DIR, f"api_{datetime.now().strftime('%Y%m%d')}.log")
api_file_handler = logging.FileHandler(api_log_file, mode='a')
api_file_handler.setLevel(logging.INFO)
api_formatter = logging.Formatter(
    '%(asctime)s | %(levelname)s | %(name)s | %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
api_file_handler.setFormatter(api_formatter)
api_logger.addHandler(api_file_handler)

# Console handler
console_handler = logging.StreamHandler()
console_handler.setLevel(logging.INFO)
console_handler.setFormatter(api_formatter)
api_logger.addHandler(console_handler)

# ============================================================================
# PYDANTIC MODELS
# ============================================================================

class HealthResponse(BaseModel):
    status: str
    ollama_connected: bool
    timestamp: str
    version: str = "1.0.0"

class AgentListResponse(BaseModel):
    agents: List[str]
    count: int

class MarketRequest(BaseModel):
    district: str = Field(default="Dubai Marina", description="Target district")
    timeframe: str = Field(default="30d", description="Analysis timeframe")

class LeadRequest(BaseModel):
    lead_name: str = Field(description="Lead/prospect name")
    source: str = Field(default="organic", description="Lead source channel")
    interactions: List[Dict[str, Any]] = Field(default_factory=list, description="Interaction history")

class FounderRequest(BaseModel):
    founder_name: str = Field(description="Founder/executive name")
    content_pieces: List[str] = Field(default_factory=list, description="Published content")
    time_period: str = Field(default="30d", description="Analysis period")
    competitor_data: Optional[Dict[str, Any]] = None

class ScenarioRequest(BaseModel):
    founder_content: float = Field(default=50.0, ge=0, le=100)
    luxury_positioning: float = Field(default=50.0, ge=0, le=100)
    influencer_deployment: float = Field(default=50.0, ge=0, le=100)
    pr_activation: float = Field(default=50.0, ge=0, le=100)
    investor_messaging: float = Field(default=50.0, ge=0, le=100)
    geographic_expansion: float = Field(default=50.0, ge=0, le=100)
    pricing_change: float = Field(default=50.0, ge=0, le=100)
    narrative_framing: float = Field(default=50.0, ge=0, le=100)
    aggression: float = Field(default=50.0, ge=0, le=100)
    risk_tolerance: float = Field(default=50.0, ge=0, le=100)
    capital_allocation: float = Field(default=50.0, ge=0, le=100)
    influence_budget: float = Field(default=50.0, ge=0, le=100)
    timeline: str = Field(default="90d", pattern="^(7d|30d|90d|180d|long)$")

class RiskRequest(BaseModel):
    context: str = Field(default="general monitoring", description="Risk analysis context")
    market_data: Dict[str, Any] = Field(default_factory=dict)
    brand_mentions: List[str] = Field(default_factory=list)

class RecommendationRequest(BaseModel):
    domain: str = Field(default="home", pattern="^(market|lead|founder|influence|home)$")
    context: str = Field(default="", description="Additional context")
    agent_inputs: Optional[Dict[str, Any]] = None

class CoordinateRequest(BaseModel):
    domain: str = Field(default="home")
    context: str = Field(default="")
    data: Dict[str, Any] = Field(default_factory=dict)

class AgentResponse(BaseModel):
    success: bool
    agent: str
    timestamp: str
    data: Dict[str, Any]
    error: Optional[str] = None

class StreamMessage(BaseModel):
    type: str
    timestamp: str
    data: Dict[str, Any]

# ============================================================================
# GLOBAL STATE
# ============================================================================

swarm: Optional[ApexSwarm] = None
active_websockets: Set[WebSocket] = set()

# ============================================================================
# LIFESPAN MANAGEMENT
# ============================================================================

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage application lifespan - initialize and cleanup."""
    global swarm
    
    api_logger.info("API startup initiated")
    audit_logger.info("API_STARTUP | status=initializing")
    
    # Initialize the swarm
    ollama_host = os.getenv("OLLAMA_HOST", "http://localhost:11434")
    ollama_model = os.getenv("OLLAMA_MODEL", DEFAULT_MODEL)
    
    try:
        swarm = ApexSwarm(ollama_host=ollama_host, ollama_model=ollama_model)
        await swarm.initialize()
        await swarm.start()
        api_logger.info("ApexSwarm initialized and started")
        audit_logger.info("API_STARTUP | status=ready | ollama_host=%s", ollama_host)
    except Exception as e:
        api_logger.error(f"Failed to initialize swarm: {e}")
        audit_logger.error(f"API_STARTUP | status=failed | error={str(e)}")
        # Create a fallback swarm that will work in degraded mode
        swarm = None
    
    yield
    
    # Cleanup
    api_logger.info("API shutdown initiated")
    audit_logger.info("API_SHUTDOWN | status=closing")
    
    if swarm:
        await swarm.stop()
    
    # Close all WebSocket connections
    for ws in list(active_websockets):
        try:
            await ws.close()
        except Exception:
            pass
    active_websockets.clear()
    
    api_logger.info("API shutdown complete")
    audit_logger.info("API_SHUTDOWN | status=closed")

# ============================================================================
# FASTAPI APP
# ============================================================================

app = FastAPI(
    title="APEX Swarm Intelligence API",
    description="Multi-agent swarm system for luxury real estate intelligence",
    version="1.0.0",
    lifespan=lifespan
)

# CORS configuration for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "https://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================================================
# ERROR HANDLERS
# ============================================================================

@app.exception_handler(OllamaConnectionError)
async def ollama_connection_handler(request, exc):
    api_logger.error(f"Ollama connection error: {exc}")
    return JSONResponse(
        status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
        content={
            "success": False,
            "error": "Ollama service unavailable",
            "detail": str(exc),
            "timestamp": datetime.now().isoformat()
        }
    )

@app.exception_handler(AgentProcessingError)
async def agent_processing_handler(request, exc):
    api_logger.error(f"Agent processing error: {exc}")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "success": False,
            "error": "Agent processing failed",
            "detail": str(exc),
            "timestamp": datetime.now().isoformat()
        }
    )

@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    api_logger.error(f"Unhandled exception: {exc}")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "success": False,
            "error": "Internal server error",
            "detail": str(exc) if os.getenv("DEBUG") else "An unexpected error occurred",
            "timestamp": datetime.now().isoformat()
        }
    )

# ============================================================================
# REST ENDPOINTS
# ============================================================================

@app.get("/", response_model=Dict[str, str])
async def root():
    """Root endpoint - API info."""
    return {
        "name": "APEX Swarm Intelligence API",
        "version": "1.0.0",
        "status": "operational",
        "docs": "/docs"
    }

@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint."""
    if not swarm:
        return HealthResponse(
            status="degraded",
            ollama_connected=False,
            timestamp=datetime.now().isoformat()
        )
    
    health = await swarm.health_check()
    return HealthResponse(
        status=health.get("status", "unknown"),
        ollama_connected=health.get("ollama_connected", False),
        timestamp=health.get("timestamp", datetime.now().isoformat())
    )

@app.get("/agents", response_model=AgentListResponse)
async def list_agents():
    """List available agents."""
    if not swarm:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Swarm not initialized"
        )
    
    agents = list(swarm.agents.keys())
    return AgentListResponse(agents=agents, count=len(agents))

@app.post("/agents/market", response_model=AgentResponse)
async def market_intelligence(request: MarketRequest):
    """Run Market Intelligence Agent analysis."""
    if not swarm:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Swarm not initialized"
        )
    
    api_logger.info(f"Market intelligence request: district={request.district}")
    audit_logger.info(f"API_REQUEST | endpoint=/agents/market | district={request.district}")
    
    try:
        result = await swarm.process("market_intelligence", request.model_dump())
        return AgentResponse(
            success=True,
            agent="market_intelligence",
            timestamp=datetime.now().isoformat(),
            data=result
        )
    except Exception as e:
        api_logger.error(f"Market intelligence failed: {e}")
        audit_logger.error(f"API_ERROR | endpoint=/agents/market | error={str(e)}")
        raise

@app.post("/agents/lead", response_model=AgentResponse)
async def lead_intelligence(request: LeadRequest):
    """Run Lead Intelligence Agent scoring."""
    if not swarm:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Swarm not initialized"
        )
    
    api_logger.info(f"Lead intelligence request: lead={request.lead_name}")
    audit_logger.info(f"API_REQUEST | endpoint=/agents/lead | lead={request.lead_name}")
    
    try:
        result = await swarm.process("lead_intelligence", request.model_dump())
        return AgentResponse(
            success=True,
            agent="lead_intelligence",
            timestamp=datetime.now().isoformat(),
            data=result
        )
    except Exception as e:
        api_logger.error(f"Lead intelligence failed: {e}")
        audit_logger.error(f"API_ERROR | endpoint=/agents/lead | error={str(e)}")
        raise

@app.post("/agents/founder", response_model=AgentResponse)
async def founder_authority(request: FounderRequest):
    """Run Founder Authority Agent analysis."""
    if not swarm:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Swarm not initialized"
        )
    
    api_logger.info(f"Founder authority request: founder={request.founder_name}")
    audit_logger.info(f"API_REQUEST | endpoint=/agents/founder | founder={request.founder_name}")
    
    try:
        result = await swarm.process("founder_authority", request.model_dump())
        return AgentResponse(
            success=True,
            agent="founder_authority",
            timestamp=datetime.now().isoformat(),
            data=result
        )
    except Exception as e:
        api_logger.error(f"Founder authority failed: {e}")
        audit_logger.error(f"API_ERROR | endpoint=/agents/founder | error={str(e)}")
        raise

@app.post("/agents/scenario", response_model=AgentResponse)
async def scenario_simulator(request: ScenarioRequest):
    """Run Scenario Simulator Agent."""
    if not swarm:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Swarm not initialized"
        )
    
    api_logger.info(f"Scenario simulation request: timeline={request.timeline}")
    audit_logger.info(f"API_REQUEST | endpoint=/agents/scenario | timeline={request.timeline}")
    
    try:
        result = await swarm.process("scenario_simulator", {
            "controls": request.model_dump()
        })
        return AgentResponse(
            success=True,
            agent="scenario_simulator",
            timestamp=datetime.now().isoformat(),
            data=result
        )
    except Exception as e:
        api_logger.error(f"Scenario simulation failed: {e}")
        audit_logger.error(f"API_ERROR | endpoint=/agents/scenario | error={str(e)}")
        raise

@app.post("/agents/risk", response_model=AgentResponse)
async def risk_sentinel(request: RiskRequest):
    """Run Risk Sentinel analysis."""
    if not swarm:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Swarm not initialized"
        )
    
    api_logger.info(f"Risk analysis request: context={request.context}")
    audit_logger.info(f"API_REQUEST | endpoint=/agents/risk | context={request.context}")
    
    try:
        result = await swarm.process("risk_sentinel", request.model_dump())
        return AgentResponse(
            success=True,
            agent="risk_sentinel",
            timestamp=datetime.now().isoformat(),
            data=result
        )
    except Exception as e:
        api_logger.error(f"Risk analysis failed: {e}")
        audit_logger.error(f"API_ERROR | endpoint=/agents/risk | error={str(e)}")
        raise

@app.post("/agents/recommendations", response_model=AgentResponse)
async def get_recommendations(request: RecommendationRequest):
    """Get AI-powered recommendations."""
    if not swarm:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Swarm not initialized"
        )
    
    api_logger.info(f"Recommendations request: domain={request.domain}")
    audit_logger.info(f"API_REQUEST | endpoint=/agents/recommendations | domain={request.domain}")
    
    try:
        result = await swarm.process("recommendation_engine", request.model_dump())
        return AgentResponse(
            success=True,
            agent="recommendation_engine",
            timestamp=datetime.now().isoformat(),
            data=result
        )
    except Exception as e:
        api_logger.error(f"Recommendations failed: {e}")
        audit_logger.error(f"API_ERROR | endpoint=/agents/recommendations | error={str(e)}")
        raise

@app.post("/coordinate", response_model=AgentResponse)
async def coordinate_agents(request: CoordinateRequest):
    """Coordinate multiple agents for complex analysis."""
    if not swarm:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Swarm not initialized"
        )
    
    api_logger.info(f"Coordination request: domain={request.domain}")
    audit_logger.info(f"API_REQUEST | endpoint=/coordinate | domain={request.domain}")
    
    try:
        result = await swarm.coordinate({
            "domain": request.domain,
            "context": request.context,
            "data": request.data
        })
        return AgentResponse(
            success=True,
            agent="coordinator",
            timestamp=datetime.now().isoformat(),
            data=result
        )
    except Exception as e:
        api_logger.error(f"Coordination failed: {e}")
        audit_logger.error(f"API_ERROR | endpoint=/coordinate | error={str(e)}")
        raise

# ============================================================================
# STREAMING ENDPOINTS
# ============================================================================

@app.get("/stream/status")
async def stream_status():
    """Server-Sent Events stream for swarm status updates."""
    if not swarm:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Swarm not initialized"
        )
    
    async def event_generator():
        # Subscribe to swarm updates
        queue = swarm.subscribe()
        
        try:
            while True:
                try:
                    # Wait for updates with timeout
                    message = await asyncio.wait_for(queue.get(), timeout=30.0)
                    
                    # Format as SSE
                    yield f"data: {json.dumps(message)}\n\n"
                    
                except asyncio.TimeoutError:
                    # Send heartbeat
                    yield f"data: {json.dumps({'type': 'heartbeat', 'timestamp': datetime.now().isoformat()})}\n\n"
                    
        except Exception as e:
            api_logger.error(f"Stream error: {e}")
            yield f"data: {json.dumps({'type': 'error', 'error': str(e)})}\n\n"
        finally:
            swarm.unsubscribe(queue)
    
    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"
        }
    )

# ============================================================================
# WEBSOCKET ENDPOINTS
# ============================================================================

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """WebSocket endpoint for real-time bidirectional communication."""
    await websocket.accept()
    active_websockets.add(websocket)
    
    client_id = str(id(websocket))
    api_logger.info(f"WebSocket connected: {client_id}")
    audit_logger.info(f"WS_CONNECT | client_id={client_id} | total={len(active_websockets)}")
    
    # Subscribe to swarm updates
    if swarm:
        swarm_queue = swarm.subscribe()
    else:
        swarm_queue = None
    
    try:
        # Send initial connection success
        await websocket.send_json({
            "type": "connection",
            "status": "connected",
            "client_id": client_id,
            "timestamp": datetime.now().isoformat(),
            "available_agents": list(swarm.agents.keys()) if swarm else []
        })
        
        # Create tasks for receiving and sending
        async def receive_messages():
            """Handle incoming messages from client."""
            while True:
                try:
                    message = await websocket.receive_json()
                    api_logger.debug(f"WebSocket message from {client_id}: {message}")
                    
                    # Process the message
                    msg_type = message.get("type")
                    
                    if msg_type == "ping":
                        await websocket.send_json({
                            "type": "pong",
                            "timestamp": datetime.now().isoformat()
                        })
                    
                    elif msg_type == "agent_request":
                        # Process agent request
                        agent_name = message.get("agent")
                        data = message.get("data", {})
                        
                        if swarm and agent_name in swarm.agents:
                            result = await swarm.process(agent_name, data)
                            await websocket.send_json({
                                "type": "agent_response",
                                "agent": agent_name,
                                "request_id": message.get("request_id"),
                                "data": result,
                                "timestamp": datetime.now().isoformat()
                            })
                        else:
                            await websocket.send_json({
                                "type": "error",
                                "error": f"Unknown agent: {agent_name}",
                                "request_id": message.get("request_id")
                            })
                    
                    elif msg_type == "subscribe_agent":
                        # Client wants updates from specific agent
                        agent_name = message.get("agent")
                        await websocket.send_json({
                            "type": "subscription_confirmed",
                            "agent": agent_name,
                            "timestamp": datetime.now().isoformat()
                        })
                    
                    elif msg_type == "health_check":
                        if swarm:
                            health = await swarm.health_check()
                            await websocket.send_json({
                                "type": "health_status",
                                "data": health,
                                "timestamp": datetime.now().isoformat()
                            })
                    
                    else:
                        await websocket.send_json({
                            "type": "error",
                            "error": f"Unknown message type: {msg_type}"
                        })
                        
                except Exception as e:
                    api_logger.error(f"WebSocket receive error: {e}")
                    break
        
        async def send_updates():
            """Send swarm updates to client."""
            if not swarm_queue:
                return
            
            while True:
                try:
                    message = await asyncio.wait_for(swarm_queue.get(), timeout=5.0)
                    await websocket.send_json(message)
                except asyncio.TimeoutError:
                    # Send periodic heartbeat
                    await websocket.send_json({
                        "type": "heartbeat",
                        "timestamp": datetime.now().isoformat()
                    })
                except Exception as e:
                    api_logger.error(f"WebSocket send error: {e}")
                    break
        
        # Run both tasks concurrently
        await asyncio.gather(
            receive_messages(),
            send_updates(),
            return_exceptions=True
        )
        
    except WebSocketDisconnect:
        api_logger.info(f"WebSocket disconnected: {client_id}")
        audit_logger.info(f"WS_DISCONNECT | client_id={client_id}")
    except Exception as e:
        api_logger.error(f"WebSocket error for {client_id}: {e}")
        audit_logger.error(f"WS_ERROR | client_id={client_id} | error={str(e)}")
    finally:
        active_websockets.discard(websocket)
        if swarm and swarm_queue:
            swarm.unsubscribe(swarm_queue)
        api_logger.info(f"WebSocket cleanup complete: {client_id}")

@app.websocket("/ws/stream")
async def websocket_stream(websocket: WebSocket):
    """Dedicated WebSocket for streaming agent outputs."""
    await websocket.accept()
    active_websockets.add(websocket)
    
    client_id = str(id(websocket))
    api_logger.info(f"Stream WebSocket connected: {client_id}")
    
    swarm_queue = swarm.subscribe() if swarm else None
    
    try:
        while True:
            if swarm_queue:
                try:
                    message = await asyncio.wait_for(swarm_queue.get(), timeout=1.0)
                    await websocket.send_json(message)
                except asyncio.TimeoutError:
                    # Send heartbeat
                    await websocket.send_json({
                        "type": "heartbeat",
                        "timestamp": datetime.now().isoformat()
                    })
            else:
                await asyncio.sleep(1.0)
                await websocket.send_json({
                    "type": "heartbeat",
                    "status": "degraded",
                    "timestamp": datetime.now().isoformat()
                })
                
    except WebSocketDisconnect:
        api_logger.info(f"Stream WebSocket disconnected: {client_id}")
    except Exception as e:
        api_logger.error(f"Stream WebSocket error: {e}")
    finally:
        active_websockets.discard(websocket)
        if swarm and swarm_queue:
            swarm.unsubscribe(swarm_queue)

# ============================================================================
# BATCH ENDPOINTS
# ============================================================================

@app.post("/batch/leads")
async def batch_lead_scoring(leads: List[LeadRequest]):
    """Score multiple leads in batch."""
    if not swarm:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Swarm not initialized"
        )
    
    api_logger.info(f"Batch lead scoring: {len(leads)} leads")
    audit_logger.info(f"API_REQUEST | endpoint=/batch/leads | count={len(leads)}")
    
    results = []
    for lead in leads:
        try:
            result = await swarm.process("lead_intelligence", lead.model_dump())
            results.append({"success": True, "data": result})
        except Exception as e:
            results.append({"success": False, "error": str(e)})
    
    return {
        "success": True,
        "count": len(leads),
        "results": results,
        "timestamp": datetime.now().isoformat()
    }

@app.post("/batch/markets")
async def batch_market_analysis(districts: List[str]):
    """Analyze multiple districts in batch."""
    if not swarm:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Swarm not initialized"
        )
    
    api_logger.info(f"Batch market analysis: {len(districts)} districts")
    audit_logger.info(f"API_REQUEST | endpoint=/batch/markets | count={len(districts)}")
    
    results = []
    for district in districts:
        try:
            result = await swarm.process("market_intelligence", {
                "district": district,
                "timeframe": "30d"
            })
            results.append({"district": district, "success": True, "data": result})
        except Exception as e:
            results.append({"district": district, "success": False, "error": str(e)})
    
    return {
        "success": True,
        "count": len(districts),
        "results": results,
        "timestamp": datetime.now().isoformat()
    }

# ============================================================================
# MAIN ENTRY POINT
# ============================================================================

if __name__ == "__main__":
    import uvicorn
    
    # Get configuration from environment
    host = os.getenv("API_HOST", "0.0.0.0")
    port = int(os.getenv("API_PORT", "8000"))
    reload = os.getenv("API_RELOAD", "false").lower() == "true"
    
    api_logger.info(f"Starting APEX API server on {host}:{port}")
    audit_logger.info(f"API_SERVER_START | host={host} | port={port}")
    
    uvicorn.run(
        "api:app",
        host=host,
        port=port,
        reload=reload,
        log_level="info"
    )