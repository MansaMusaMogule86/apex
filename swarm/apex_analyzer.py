#!/usr/bin/env python3
"""
APEX Intelligence Analyzer Engine
Real-time content scoring, signal generation, and timeline analysis.
"""

import json
import random
import time
from datetime import datetime, timedelta
from typing import Dict, List, Optional, TypedDict
from dataclasses import dataclass, asdict
import asyncio

# === DATA MODELS ===

@dataclass
class ContentScore:
    """Individual content performance metrics"""
    id: str
    title: str
    trust: float           # 0-100, credibility score
    auth_conv: float       # 0-100, authority conversion rate
    engagement: float      # 0-100, audience engagement
    appts: int             # Number of appointments generated
    investor_signal: str   # STRONG, MODERATE, WEAK
    type: str              # memo, brief, interview, analysis

    def composite_score(self) -> float:
        """Calculate weighted composite score"""
        return (
            self.trust * 0.3 +
            self.auth_conv * 0.25 +
            self.engagement * 0.25 +
            min(self.appts * 5, 100) * 0.2
        )

@dataclass
class Signal:
    """Real-time intelligence signal"""
    id: str
    tag: str               # AUTH, INV, NARR, TRUST, COMP
    headline: str
    value: str
    timestamp: str
    status: str            # positive, negative, neutral
    source: str            # internal, external, ai_generated

@dataclass
class TimelineEvent:
    """Chronological intelligence event"""
    id: str
    time: str
    title: str
    description: str
    impact: str            # critical, high, medium, low
    category: str
    metadata: Dict

@dataclass
class Alert:
    """System alert for executive attention"""
    id: str
    level: str             # P1, P2, P3, P4
    title: str
    description: str
    timestamp: str
    auto_resolve: bool
    resolved: bool = False

# === ANALYZER ENGINE ===

class ApexAnalyzer:
    """Core intelligence analysis engine"""

    def __init__(self):
        self.content_history: List[ContentScore] = []
        self.signal_history: List[Signal] = []
        self.timeline: List[TimelineEvent] = []
        self.alerts: List[Alert] = []
        self.scenarios = {
            "market": "standby",
            "lead": "standby", 
            "authority": "standby",
            "influence": "standby"
        }

    def analyze_content(self, raw_data: Dict) -> ContentScore:
        """Analyze raw content and generate scores"""

        # Extract metrics from raw data
        title = raw_data.get("title", "Untitled")
        content_type = raw_data.get("type", "memo")

        # Calculate trust score based on factors
        factual_density = raw_data.get("factual_density", 0.7)
        source_credibility = raw_data.get("source_credibility", 0.8)
        consistency_score = raw_data.get("consistency", 0.9)

        trust = (factual_density * 0.4 + source_credibility * 0.35 + consistency_score * 0.25) * 100

        # Calculate authority conversion
        expert_quotes = raw_data.get("expert_quotes", 2)
        data_points = raw_data.get("data_points", 5)
        auth_conv = min((expert_quotes * 10 + data_points * 5), 100)

        # Calculate engagement
        readability = raw_data.get("readability", 0.8)
        emotional_resonance = raw_data.get("emotional_resonance", 0.7)
        engagement = (readability * 0.5 + emotional_resonance * 0.5) * 100

        # Calculate appointments (correlated with engagement + trust)
        appts = int((engagement * 0.6 + trust * 0.4) / 10)

        # Determine investor signal
        composite = (trust * 0.3 + auth_conv * 0.25 + engagement * 0.25 + min(appts * 5, 100) * 0.2)
        if composite > 85:
            investor_signal = "STRONG"
        elif composite > 70:
            investor_signal = "MODERATE"
        else:
            investor_signal = "WEAK"

        score = ContentScore(
            id=f"content_{len(self.content_history) + 1}",
            title=title,
            trust=round(trust, 1),
            auth_conv=round(auth_conv, 1),
            engagement=round(engagement, 1),
            appts=appts,
            investor_signal=investor_signal,
            type=content_type
        )

        self.content_history.append(score)
        self._generate_content_signals(score)

        return score

    def _generate_content_signals(self, content: ContentScore):
        """Generate signals from content analysis"""

        # Trust signal
        if content.trust > 90:
            self.add_signal("TRUST", f"Content trust score exceeded 90: {content.title[:50]}...", 
                           f"+{content.trust - 90:.1f}%", "positive")

        # Authority signal
        if content.auth_conv > 35:
            self.add_signal("AUTH", f"Authority conversion peak: {content.title[:50]}...",
                           f"+{content.auth_conv:.1f}%", "positive")

        # Investor signal
        if content.investor_signal == "STRONG":
            self.add_signal("INV", f"Strong investor signal detected: {content.title[:50]}...",
                           "STRONG", "positive")

        # Narrative signal
        if content.engagement > 85:
            self.add_signal("NARR", f"High narrative engagement: {content.title[:50]}...",
                           f"+{content.engagement:.1f}%", "positive")

    def add_signal(self, tag: str, headline: str, value: str, status: str):
        """Add a new signal to the stream"""
        signal = Signal(
            id=f"sig_{len(self.signal_history) + 1}",
            tag=tag,
            headline=headline,
            value=value,
            timestamp=datetime.now().strftime("%H:%M:%S"),
            status=status,
            source="ai_generated"
        )
        self.signal_history.append(signal)

        # Auto-generate timeline event
        self._signal_to_timeline(signal)

        # Check for alerts
        self._check_signal_alerts(signal)

    def _signal_to_timeline(self, signal: Signal):
        """Convert signal to timeline event"""
        impact_map = {
            "positive": "medium",
            "negative": "high",
            "neutral": "low"
        }

        event = TimelineEvent(
            id=f"evt_{len(self.timeline) + 1}",
            time=signal.timestamp,
            title=signal.headline,
            description=f"Signal generated with value {signal.value}. Tag: {signal.tag}",
            impact=impact_map.get(signal.status, "low"),
            category=signal.tag,
            metadata={"value": signal.value, "status": signal.status}
        )
        self.timeline.append(event)

    def _check_signal_alerts(self, signal: Signal):
        """Check if signal triggers an alert"""

        # P1: Critical negative signals
        if signal.status == "negative" and signal.tag in ["TRUST", "AUTH"]:
            self.add_alert("P1", f"Critical {signal.tag} degradation", 
                          signal.headline, auto_resolve=False)

        # P2: Significant negative
        elif signal.status == "negative":
            self.add_alert("P2", f"{signal.tag} warning", 
                          signal.headline, auto_resolve=True)

        # P3: Positive milestones
        elif signal.status == "positive" and signal.tag == "INV":
            self.add_alert("P3", f"Investor signal: {signal.value}",
                          signal.headline, auto_resolve=True)

    def add_alert(self, level: str, title: str, description: str, auto_resolve: bool):
        """Add executive alert"""
        alert = Alert(
            id=f"alert_{len(self.alerts) + 1}",
            level=level,
            title=title,
            description=description,
            timestamp=datetime.now().strftime("%H:%M:%S"),
            auto_resolve=auto_resolve
        )
        self.alerts.append(alert)

        # If P1, escalate scenario
        if level == "P1":
            self.scenarios["authority"] = "engaged"

    def get_recommendation(self) -> Dict:
        """Generate top recommendation based on all data"""

        if not self.content_history:
            return {
                "headline": "No data available",
                "action": "Initialize data streams",
                "confidence": 0,
                "priority": 0
            }

        # Find highest scoring content
        best_content = max(self.content_history, key=lambda x: x.composite_score())

        # Count active alerts
        active_p1 = sum(1 for a in self.alerts if a.level == "P1" and not a.resolved)

        # Generate recommendation
        if active_p1 > 0:
            return {
                "headline": f"URGENT: {active_p1} critical alerts require immediate action",
                "action": "Escalate to executive team immediately. Review authority degradation.",
                "confidence": 95,
                "priority": 100,
                "alert_level": "P1"
            }

        elif best_content.composite_score() > 85:
            return {
                "headline": f"Double down on: {best_content.title[:60]}...",
                "action": "Increase distribution budget by 20%. Schedule follow-up content.",
                "confidence": best_content.trust,
                "priority": best_content.engagement,
                "alert_level": "P3"
            }

        else:
            return {
                "headline": "Content performance below threshold",
                "action": "Review content strategy. A/B test new formats.",
                "confidence": 60,
                "priority": 70,
                "alert_level": "P4"
            }

    def get_dashboard_data(self) -> Dict:
        """Export complete dashboard dataset"""
        return {
            "content": [asdict(c) for c in self.content_history[-10:]],
            "signals": [asdict(s) for s in self.signal_history[-20:]],
            "timeline": [asdict(t) for t in self.timeline[-50:]],
            "alerts": [asdict(a) for a in self.alerts if not a.resolved],
            "scenarios": self.scenarios,
            "recommendation": self.get_recommendation(),
            "timestamp": datetime.now().isoformat()
        }

    def export_json(self, filename: str = "apex_export.json"):
        """Export all data to JSON file"""
        data = self.get_dashboard_data()
        with open(filename, "w") as f:
            json.dump(data, f, indent=2)
        return filename

# === SIMULATION ===

def run_simulation():
    """Run a full simulation of the analyzer"""

    analyzer = ApexAnalyzer()

    print("=" * 60)
    print("APEX INTELLIGENCE ANALYZER  SIMULATION")
    print("=" * 60)

    # Simulate content ingestion
    test_content = [
        {
            "title": "Founder market memo: scarcity and discipline",
            "type": "memo",
            "factual_density": 0.92,
            "source_credibility": 0.95,
            "consistency": 0.88,
            "expert_quotes": 3,
            "data_points": 8,
            "readability": 0.85,
            "emotional_resonance": 0.78
        },
        {
            "title": "Institutional brief: delivery certainty framework",
            "type": "brief",
            "factual_density": 0.88,
            "source_credibility": 0.90,
            "consistency": 0.92,
            "expert_quotes": 2,
            "data_points": 6,
            "readability": 0.80,
            "emotional_resonance": 0.72
        },
        {
            "title": "Founder interview: strategic capital lens",
            "type": "interview",
            "factual_density": 0.85,
            "source_credibility": 0.88,
            "consistency": 0.85,
            "expert_quotes": 4,
            "data_points": 5,
            "readability": 0.90,
            "emotional_resonance": 0.82
        }
    ]

    print("\n[1] Analyzing content...")
    for content in test_content:
        score = analyzer.analyze_content(content)
        print(f"   {score.title[:50]}... | Trust: {score.trust} | Signal: {score.investor_signal}")

    print("\n[2] Generated signals:")
    for sig in analyzer.signal_history[-5:]:
        print(f"  [{sig.tag}] {sig.headline[:50]}... | {sig.value} | {sig.status}")

    print("\n[3] Active alerts:")
    for alert in analyzer.alerts:
        status = "✓ RESOLVED" if alert.resolved else "⚠ ACTIVE"
        print(f"  [{alert.level}] {alert.title[:40]}... | {status}")

    print("\n[4] Top recommendation:")
    rec = analyzer.get_recommendation()
    print(f"  Headline: {rec['headline']}")
    print(f"  Action: {rec['action']}")
    print(f"  Confidence: {rec['confidence']}% | Priority: {rec['priority']}")

    print("\n[5] Exporting dashboard data...")
    filename = analyzer.export_json()
    print(f"   Saved to {filename}")

    print("\n[6] Scenario states:")
    for domain, state in analyzer.scenarios.items():
        print(f"  {domain.upper()}: {state.upper()}")

    print("\n" + "=" * 60)
    print("SIMULATION COMPLETE")
    print("=" * 60)

    return analyzer

if __name__ == "__main__":
    analyzer = run_simulation()

    # Interactive mode
    print("\nEntering interactive mode. Type 'help' for commands.")
    while True:
        cmd = input("\napex> ").strip().lower()

        if cmd == "exit":
            break
        elif cmd == "help":
            print("Commands: export, signals, alerts, recommend, status, exit")
        elif cmd == "export":
            filename = analyzer.export_json()
            print(f"Exported to {filename}")
        elif cmd == "signals":
            for sig in analyzer.signal_history[-5:]:
                print(f"[{sig.tag}] {sig.headline}")
        elif cmd == "alerts":
            for alert in analyzer.alerts:
                print(f"[{alert.level}] {alert.title} → {'Resolved' if alert.resolved else 'Active'}")
        elif cmd == "recommend":
            rec = analyzer.get_recommendation()
            print(f"{rec['headline']}\nAction: {rec['action']}")
        elif cmd == "status":
            print(json.dumps(analyzer.get_dashboard_data(), indent=2)[:500] + "...")
        else:
            print("Unknown command. Type 'help' for list.")
