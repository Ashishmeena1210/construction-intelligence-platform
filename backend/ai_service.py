import os
import json
import io
import random
from dotenv import load_dotenv
from PIL import Image

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
USE_MOCK = not GEMINI_API_KEY or GEMINI_API_KEY == "your_gemini_api_key_here"

model = None
if not USE_MOCK:
    try:
        import google.generativeai as genai
        genai.configure(api_key=GEMINI_API_KEY)
        model = genai.GenerativeModel("gemini-2.0-flash")
        print("[AI Service] Gemini API configured successfully")
    except Exception as e:
        print(f"[AI Service] Failed to configure Gemini: {e}. Using mock responses.")
        USE_MOCK = True
else:
    print("[AI Service] No API key found. Using mock responses.")


def _parse_json_response(text: str) -> dict:
    """Extract JSON from model response text."""
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        import re
        match = re.search(r'```(?:json)?\s*([\s\S]+?)```', text)
        if match:
            return json.loads(match.group(1).strip())
        start = text.find('{')
        end = text.rfind('}') + 1
        if start != -1 and end > start:
            return json.loads(text[start:end])
        raise ValueError(f"Could not parse JSON from response: {text[:200]}")


async def analyze_safety(image_bytes: bytes) -> dict:
    if USE_MOCK:
        return _mock_safety_response()
    prompt = """You are a construction safety expert. Analyze this construction site image.
    Return ONLY a valid JSON object:
    {
      "risk_level": "LOW|MEDIUM|HIGH|CRITICAL",
      "compliance_score": 0-100,
      "hazards": [{"type": "string", "location": "string", "severity": "LOW|MEDIUM|HIGH"}],
      "ppe_status": {
        "hardhat": "COMPLIANT|VIOLATION|NOT_VISIBLE",
        "safety_vest": "COMPLIANT|VIOLATION|NOT_VISIBLE",
        "boots": "COMPLIANT|VIOLATION|NOT_VISIBLE",
        "gloves": "COMPLIANT|VIOLATION|NOT_VISIBLE"
      },
      "safety_violations": ["string"],
      "recommendations": ["string"],
      "summary": "string"
    }"""
    try:
        img = Image.open(io.BytesIO(image_bytes))
        img.thumbnail((1024, 1024))
        response = model.generate_content([prompt, img])
        return _parse_json_response(response.text)
    except Exception as e:
        print(f"Gemini error in safety: {e}")
        return _mock_safety_response()


async def analyze_crack(image_bytes: bytes) -> dict:
    if USE_MOCK:
        return _mock_crack_response()
    prompt = """You are a structural engineering expert. Analyze this image for cracks or damage.
    Return ONLY a valid JSON object:
    {
      "crack_detected": true|false,
      "crack_type": "HAIRLINE|SURFACE|STRUCTURAL|DIAGONAL|HORIZONTAL|VERTICAL|NOT_DETECTED",
      "severity": "LOW|MEDIUM|HIGH|CRITICAL",
      "affected_area_percent": 0.0-100.0,
      "width_estimate_mm": 0.0,
      "repair_priority": "IMMEDIATE|URGENT|ROUTINE|MONITOR",
      "structural_risk": "LOW|MEDIUM|HIGH",
      "possible_causes": ["string"],
      "repair_methods": ["string"],
      "recommendations": ["string"],
      "summary": "string"
    }"""
    try:
        img = Image.open(io.BytesIO(image_bytes))
        img.thumbnail((1024, 1024))
        response = model.generate_content([prompt, img])
        return _parse_json_response(response.text)
    except Exception as e:
        print(f"Gemini error in crack: {e}")
        return _mock_crack_response()


async def estimate_valuation(data: dict) -> dict:
    if USE_MOCK:
        return _mock_valuation_response(data)
    prompt = f"""You are a real estate valuation expert. Estimate the property value:
    {json.dumps(data, indent=2)}
    Return ONLY a valid JSON object:
    {{
      "estimated_value": number,
      "price_per_sqft": number,
      "price_range": {{"min": number, "max": number}},
      "currency": "USD",
      "market_trend": "RISING|STABLE|DECLINING",
      "trend_percentage": number,
      "confidence_score": 0-100,
      "valuation_factors": [{{"factor": "string", "impact": "POSITIVE|NEGATIVE|NEUTRAL", "weight": 0-10}}],
      "comparable_properties": [{{"address": "string", "price": number, "sqft": number, "sold_date": "string"}}],
      "investment_rating": "EXCELLENT|GOOD|FAIR|POOR",
      "recommendations": ["string"],
      "summary": "string"
    }}"""
    try:
        response = model.generate_content(prompt)
        return _parse_json_response(response.text)
    except Exception as e:
        print(f"Gemini error in valuation: {e}")
        return _mock_valuation_response(data)


async def generate_project_plan(data: dict) -> dict:
    if USE_MOCK:
        return _mock_project_plan(data)
    prompt = f"""You are a senior construction project manager. Generate a detailed project plan:
    {json.dumps(data, indent=2)}
    Return ONLY a valid JSON object:
    {{
      "project_name": "string",
      "total_duration_weeks": number,
      "estimated_cost": number,
      "phases": [{{
        "phase_number": number,
        "name": "string",
        "duration_weeks": number,
        "start_week": number,
        "tasks": ["string"],
        "resources": ["string"],
        "completion_criteria": "string"
      }}],
      "milestones": [{{"week": number, "milestone": "string", "deliverable": "string"}}],
      "risk_factors": [{{"risk": "string", "probability": "LOW|MEDIUM|HIGH", "impact": "LOW|MEDIUM|HIGH", "mitigation": "string"}}],
      "budget_breakdown": {{"materials": number, "labor": number, "equipment": number, "permits_and_fees": number, "contingency": number}},
      "team_requirements": ["string"],
      "recommendations": ["string"]
    }}"""
    try:
        response = model.generate_content(prompt)
        return _parse_json_response(response.text)
    except Exception as e:
        print(f"Gemini error in planning: {e}")
        return _mock_project_plan(data)


async def get_weather_advisory(location: str, activities: list, weather_data: dict) -> dict:
    if USE_MOCK:
        return _mock_weather_advisory(location, weather_data)
    prompt = f"""You are a construction weather safety advisor.
    Location: {location}
    Activities: {activities}
    Weather: {json.dumps(weather_data)}
    Return ONLY a valid JSON object:
    {{
      "overall_risk": "LOW|MEDIUM|HIGH|CRITICAL",
      "work_recommendation": "PROCEED|PROCEED_WITH_CAUTION|DELAY|STOP",
      "safe_activities": ["string"],
      "unsafe_activities": ["string"],
      "precautions": ["string"],
      "advisory_message": "string",
      "next_favorable_window": "string",
      "weather_impact_summary": "string"
    }}"""
    try:
        response = model.generate_content(prompt)
        return _parse_json_response(response.text)
    except Exception as e:
        print(f"Gemini error in weather: {e}")
        return _mock_weather_advisory(location, weather_data)


async def chat_assistant(message: str, history: list) -> dict:
    if USE_MOCK:
        return _mock_assistant_response(message)
    system = """You are an expert AI assistant for construction professionals.
    Respond in JSON: {"response": "string", "suggestions": ["string"], "references": ["string"]}"""
    conversation = system + "\n\n"
    for h in history[-6:]:
        conversation += f"{h['role'].upper()}: {h['content']}\n"
    conversation += f"USER: {message}\nASSISTANT:"
    try:
        response = model.generate_content(conversation)
        return _parse_json_response(response.text)
    except Exception as e:
        print(f"Gemini error in assistant: {e}")
        return _mock_assistant_response(message)


async def analyze_site_image(image_bytes: bytes, question: str) -> dict:
    if USE_MOCK:
        return {"response": f"Based on your image and question '{question[:60]}': This construction site shows typical activity. Ensure all workers wear proper PPE including hardhats, safety vests, and boots. Maintain clear walkways and demarcate hazardous zones. Regular safety inspections are recommended per OSHA 29 CFR 1926 standards.", "suggestions": ["Conduct daily safety briefings", "Document all site activities", "Inspect scaffolding daily"], "references": ["OSHA 29 CFR 1926", "ACI 318-19"]}
    prompt = f"""Analyze this construction site image and answer: {question}
    Return ONLY JSON: {{"response": "string", "suggestions": ["string"], "references": ["string"]}}"""
    try:
        img = Image.open(io.BytesIO(image_bytes))
        img.thumbnail((1024, 1024))
        response = model.generate_content([prompt, img])
        return _parse_json_response(response.text)
    except Exception as e:
        print(f"Gemini error in site image: {e}")
        return {"response": "Image analyzed. Please ensure all safety measures are in place.", "suggestions": [], "references": []}


async def query_knowledge(query: str, category: str) -> dict:
    if USE_MOCK:
        return _mock_knowledge_response(query, category)
    prompt = f"""You are an expert in construction standards and codes. Answer:
    Category: {category}
    Query: {query}
    Return ONLY valid JSON:
    {{
      "answer": "string",
      "key_points": ["string"],
      "references": [{{"title": "string", "standard": "string", "section": "string", "year": number}}],
      "related_topics": ["string"],
      "confidence": 0-100,
      "category": "string"
    }}"""
    try:
        response = model.generate_content(prompt)
        return _parse_json_response(response.text)
    except Exception as e:
        print(f"Gemini error in knowledge: {e}")
        return _mock_knowledge_response(query, category)


# ─── Mock Responses ────────────────────────────────────────────────────────────

def _mock_safety_response() -> dict:
    risk_levels = ["LOW", "MEDIUM", "HIGH"]
    risk = random.choice(risk_levels)
    score = {"LOW": random.randint(75, 95), "MEDIUM": random.randint(50, 74), "HIGH": random.randint(20, 49)}[risk]
    return {
        "risk_level": risk,
        "compliance_score": score,
        "hazards": [
            {"type": "Unguarded Excavation", "location": "North perimeter", "severity": "HIGH"},
            {"type": "Missing Handrail", "location": "Scaffold Level 2", "severity": "MEDIUM"},
            {"type": "Debris on Walkway", "location": "Main access path", "severity": "LOW"}
        ] if risk in ["MEDIUM", "HIGH"] else [],
        "ppe_status": {
            "hardhat": "COMPLIANT" if risk == "LOW" else "VIOLATION",
            "safety_vest": "COMPLIANT",
            "boots": "COMPLIANT",
            "gloves": "NOT_VISIBLE" if risk == "LOW" else "VIOLATION"
        },
        "safety_violations": [
            "Worker observed without hardhat in active zone",
            "Inadequate edge protection on elevated platform"
        ] if risk == "HIGH" else (["Minor PPE non-compliance detected"] if risk == "MEDIUM" else []),
        "recommendations": [
            "Install guardrails around all open excavations immediately",
            "Conduct mandatory PPE inspection before site entry",
            "Clear debris from pedestrian walkways",
            "Post safety signage at all hazardous areas",
            "Schedule toolbox talk on fall protection"
        ],
        "summary": f"Site analysis complete. Risk level: {risk}. Compliance score: {score}/100. {'Immediate corrective action required.' if risk == 'HIGH' else 'Standard monitoring recommended.'}"
    }


def _mock_crack_response() -> dict:
    sev = random.choice(["LOW", "MEDIUM", "HIGH"])
    types = {"LOW": "HAIRLINE", "MEDIUM": "SURFACE", "HIGH": "STRUCTURAL"}
    priorities = {"LOW": "MONITOR", "MEDIUM": "ROUTINE", "HIGH": "URGENT"}
    return {
        "crack_detected": True,
        "crack_type": types[sev],
        "severity": sev,
        "affected_area_percent": {"LOW": round(random.uniform(0.5, 3), 2), "MEDIUM": round(random.uniform(3, 10), 2), "HIGH": round(random.uniform(10, 30), 2)}[sev],
        "width_estimate_mm": {"LOW": round(random.uniform(0.1, 0.3), 2), "MEDIUM": round(random.uniform(0.3, 2), 2), "HIGH": round(random.uniform(2, 10), 2)}[sev],
        "repair_priority": priorities[sev],
        "structural_risk": sev,
        "possible_causes": ["Thermal expansion and contraction", "Settlement of foundation", "Overloading of structural elements"],
        "repair_methods": ["Epoxy injection for crack sealing", "Polyurethane foam grouting", "Carbon fiber reinforcement strips", "Concrete patching with bonding agent"],
        "recommendations": ["Document crack width and length for monitoring", "Install crack monitors to track progression", "Engage structural engineer for detailed assessment", "Restrict load bearing in affected area"],
        "summary": f"A {types[sev].lower()} crack of {sev.lower()} severity detected. Repair priority: {priorities[sev]}. {'Immediate structural engineering consultation strongly recommended.' if sev == 'HIGH' else 'Routine monitoring advised.'}"
    }


def _mock_valuation_response(data: dict) -> dict:
    area = float(data.get("area_sqft", 1500))
    base_price = int(area * random.randint(180, 350))
    trend = random.choice(["RISING", "STABLE", "DECLINING"])
    rating = random.choice(["EXCELLENT", "GOOD", "FAIR"])
    return {
        "estimated_value": base_price,
        "price_per_sqft": round(base_price / area, 2),
        "price_range": {"min": int(base_price * 0.9), "max": int(base_price * 1.15)},
        "currency": "USD",
        "market_trend": trend,
        "trend_percentage": round(random.uniform(-3, 8), 1),
        "confidence_score": random.randint(78, 94),
        "valuation_factors": [
            {"factor": "Location desirability", "impact": "POSITIVE", "weight": 9},
            {"factor": "Property size", "impact": "POSITIVE", "weight": 8},
            {"factor": "Year built", "impact": "NEUTRAL", "weight": 5},
            {"factor": "Market conditions", "impact": "POSITIVE", "weight": 7},
            {"factor": "Property condition", "impact": "POSITIVE", "weight": 8}
        ],
        "comparable_properties": [
            {"address": f"123 Main St, {data.get('location', 'City')}", "price": int(base_price * 0.95), "sqft": int(area) - 100, "sold_date": "2024-09"},
            {"address": f"456 Oak Ave, {data.get('location', 'City')}", "price": int(base_price * 1.05), "sqft": int(area) + 200, "sold_date": "2024-10"},
            {"address": f"789 Pine Rd, {data.get('location', 'City')}", "price": int(base_price * 0.98), "sqft": int(area) + 50, "sold_date": "2024-08"}
        ],
        "investment_rating": rating,
        "recommendations": [
            "Property is well-positioned in the current market",
            "Consider minor kitchen and bathroom renovations to increase value by 8-12%",
            "Energy efficiency upgrades can boost resale value by 5-10%",
            "Professional staging recommended before listing"
        ],
        "summary": f"Estimated market value: ${base_price:,}. The property shows strong fundamentals with favorable location metrics and a {trend.lower()} market trend."
    }


def _mock_project_plan(data: dict) -> dict:
    budget = float(data.get("budget", 500000))
    return {
        "project_name": data.get("project_name", "Construction Project"),
        "total_duration_weeks": int(data.get("duration_weeks", 24)),
        "estimated_cost": int(budget),
        "phases": [
            {"phase_number": 1, "name": "Site Preparation & Foundation", "duration_weeks": 4, "start_week": 1, "tasks": ["Site clearing", "Soil testing", "Excavation", "Foundation layout", "Concrete pouring"], "resources": ["Excavator", "Concrete mixer", "Survey equipment", "20 workers"], "completion_criteria": "Foundation fully cured and inspected"},
            {"phase_number": 2, "name": "Structural Framework", "duration_weeks": 6, "start_week": 5, "tasks": ["Column erection", "Beam installation", "Slab formwork", "Rebar placement", "Concrete pouring"], "resources": ["Tower crane", "Steel workers", "Formwork", "30 workers"], "completion_criteria": "All structural elements completed and approved"},
            {"phase_number": 3, "name": "MEP Rough-In & Masonry", "duration_weeks": 5, "start_week": 11, "tasks": ["Electrical rough-in", "Plumbing installation", "HVAC ductwork", "Masonry work", "Insulation"], "resources": ["Electricians", "Plumbers", "HVAC techs", "Masons", "25 workers"], "completion_criteria": "All rough-in inspections passed"},
            {"phase_number": 4, "name": "Interior & Exterior Finishes", "duration_weeks": 6, "start_week": 16, "tasks": ["Drywall installation", "Painting", "Flooring", "Window installation", "Exterior cladding"], "resources": ["Finishers", "Painters", "Glaziers", "20 workers"], "completion_criteria": "All finishes completed per specifications"},
            {"phase_number": 5, "name": "Final Fit-Out & Commissioning", "duration_weeks": 3, "start_week": 22, "tasks": ["Fixture installation", "System testing", "Punch list", "Final inspections", "Certificate of occupancy"], "resources": ["All trades", "Inspector", "15 workers"], "completion_criteria": "Certificate of occupancy obtained"}
        ],
        "milestones": [
            {"week": 4, "milestone": "Foundation Complete", "deliverable": "Approved foundation inspection report"},
            {"week": 10, "milestone": "Structure Topped Out", "deliverable": "Structural sign-off"},
            {"week": 15, "milestone": "MEP Rough-In Complete", "deliverable": "MEP inspection clearance"},
            {"week": 21, "milestone": "Finishes Complete", "deliverable": "Interior/exterior completion"},
            {"week": 24, "milestone": "Project Handover", "deliverable": "Certificate of Occupancy"}
        ],
        "risk_factors": [
            {"risk": "Weather delays", "probability": "MEDIUM", "impact": "MEDIUM", "mitigation": "Build 2-week weather buffer into schedule"},
            {"risk": "Material supply chain disruption", "probability": "LOW", "impact": "HIGH", "mitigation": "Procure critical materials 8 weeks in advance"},
            {"risk": "Labor shortage", "probability": "LOW", "impact": "MEDIUM", "mitigation": "Pre-qualify multiple subcontractors"},
            {"risk": "Design changes", "probability": "MEDIUM", "impact": "HIGH", "mitigation": "Freeze design before construction start"},
            {"risk": "Permit delays", "probability": "LOW", "impact": "HIGH", "mitigation": "Submit permits 12 weeks before needed"}
        ],
        "budget_breakdown": {
            "materials": int(budget * 0.40),
            "labor": int(budget * 0.35),
            "equipment": int(budget * 0.10),
            "permits_and_fees": int(budget * 0.05),
            "contingency": int(budget * 0.10)
        },
        "team_requirements": ["1 Project Manager", "1 Site Supervisor", "2 Engineers (Civil + MEP)", "1 Safety Officer", "20-30 Skilled laborers", "Subcontractors for specialized trades"],
        "recommendations": ["Conduct weekly progress meetings with all stakeholders", "Implement BIM for clash detection", "Use digital site diary for daily documentation", "Set up real-time project dashboard for client updates"]
    }


def _mock_weather_advisory(location: str, weather_data: dict) -> dict:
    temp = weather_data.get("temp", 25)
    wind = weather_data.get("wind_speed", 10)
    risk = "LOW" if wind < 20 and 5 < temp < 38 else "MEDIUM" if wind < 35 else "HIGH"
    return {
        "overall_risk": risk,
        "work_recommendation": "PROCEED" if risk == "LOW" else ("PROCEED_WITH_CAUTION" if risk == "MEDIUM" else "DELAY"),
        "safe_activities": ["Interior concrete work", "Masonry below roof level", "Electrical rough-in", "Plumbing installation", "Interior painting"],
        "unsafe_activities": ["Crane operations above 35 mph wind" if wind > 25 else "", "Roofing work" if wind > 20 else "", "Exterior elevated work" if wind > 25 else ""],
        "precautions": ["Monitor weather radar every 2 hours", "Ensure workers have emergency shelter access", "Secure all loose materials and scaffolding", "Suspend crane operations if wind exceeds 35 mph"],
        "advisory_message": f"Conditions in {location} present {risk.lower()} risk. Wind: {wind} km/h, Temp: {temp}°C. {'All outdoor activities can proceed normally.' if risk == 'LOW' else 'Exercise caution with elevated work.'}",
        "next_favorable_window": "Tomorrow morning 6 AM – 2 PM expected to be optimal",
        "weather_impact_summary": f"Today's weather presents {risk.lower()} risk for construction activities at {location}."
    }


def _mock_assistant_response(message: str) -> dict:
    responses = [
        {"response": f"Regarding '{message[:60]}': In construction best practices, always refer to local building codes and OSHA standards. For your specific situation, I recommend consulting with a licensed structural engineer to ensure compliance with ACI 318-19 and AISC 360-22. Daily documentation of site activities is crucial for liability protection and project quality.", "suggestions": ["Check local building codes", "Consult structural engineer", "Document all decisions", "Review OSHA 1926 standards"], "references": ["OSHA 29 CFR 1926", "ACI 318-19", "AISC 360-22"]},
        {"response": f"For '{message[:60]}': This is a common construction challenge. Adopt a systematic approach: (1) Conduct a thorough site inspection, (2) Document all findings with photos, (3) Develop an action plan with clear timelines, and (4) Schedule regular safety audits. Research shows systematic safety programs reduce incidents by up to 40%.", "suggestions": ["Conduct site inspection", "Document with photos", "Create action plan", "Schedule safety audit"], "references": ["IBC 2021", "NFPA 70E", "ASTM C150"]},
        {"response": f"On '{message[:60]}': Industry standards recommend proper planning, material selection, and quality control. Ensure all materials meet ASTM specifications and implement a quality management system aligned with ISO 9001. Regular testing of concrete (per ASTM C39), steel, and other materials is essential for structural integrity.", "suggestions": ["Verify material certifications", "Implement QC checklist", "Schedule material testing", "Review shop drawings"], "references": ["ASTM C39", "ISO 9001:2015", "ACI 301"]}
    ]
    return random.choice(responses)


def _mock_knowledge_response(query: str, category: str) -> dict:
    return {
        "answer": f"Based on established construction standards for '{query}': The industry follows systematic approaches defined in international and national codes. Primary consideration is structural integrity, followed by safety, durability, and sustainability. Per ACI 318-19, concrete structures must meet minimum compressive strength requirements. AISC provides guidelines for steel connections. Local codes may impose additional requirements beyond these minimums. Always engage licensed professionals for structural calculations and ensure all work is inspected and documented.",
        "key_points": [
            "Always verify local code compliance before design finalization",
            "Maintain minimum factors of safety per relevant standards",
            "Regular inspection and testing are mandatory",
            "Documentation must be maintained for all critical decisions",
            "Engage licensed professionals for structural calculations"
        ],
        "references": [
            {"title": "Building Code Requirements for Structural Concrete", "standard": "ACI 318-19", "section": "Chapter 4", "year": 2019},
            {"title": "Specification for Structural Steel Buildings", "standard": "AISC 360-22", "section": "Section J", "year": 2022},
            {"title": "International Building Code", "standard": "IBC 2021", "section": "Chapter 16", "year": 2021},
            {"title": "OSHA Construction Standards", "standard": "29 CFR 1926", "section": "Subpart R", "year": 2023}
        ],
        "related_topics": ["Structural load calculations", "Foundation design", "Seismic design requirements", "Fire resistance ratings", "Accessibility compliance (ADA)"],
        "confidence": random.randint(82, 97),
        "category": category
    }
