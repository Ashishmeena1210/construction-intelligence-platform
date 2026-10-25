from fastapi import APIRouter
from ai_service import get_weather_advisory
from pydantic import BaseModel
from typing import List
import httpx
import os
from dotenv import load_dotenv

load_dotenv()
router = APIRouter(prefix="/api/weather", tags=["Weather"])
OPENWEATHER_API_KEY = os.getenv("OPENWEATHER_API_KEY", "")


class WeatherRequest(BaseModel):
    location: str
    planned_activities: List[str] = []


def _mock_weather_data(location: str) -> dict:
    import random
    conditions = ["Clear", "Partly Cloudy", "Overcast", "Light Rain", "Cloudy"]
    return {
        "temp": round(random.uniform(18, 35), 1),
        "feels_like": round(random.uniform(15, 38), 1),
        "humidity": random.randint(30, 85),
        "wind_speed": round(random.uniform(5, 40), 1),
        "wind_direction": random.choice(["N", "NE", "E", "SE", "S", "SW", "W", "NW"]),
        "condition": random.choice(conditions),
        "description": "Typical construction day conditions",
        "visibility_km": round(random.uniform(5, 15), 1),
        "uv_index": random.randint(1, 10),
        "pressure_hpa": random.randint(1000, 1025),
        "location": location,
        "source": "mock"
    }


async def _fetch_real_weather(location: str) -> dict:
    url = f"https://api.openweathermap.org/data/2.5/weather?q={location}&appid={OPENWEATHER_API_KEY}&units=metric"
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.get(url)
            if resp.status_code == 200:
                data = resp.json()
                return {
                    "temp": data["main"]["temp"],
                    "feels_like": data["main"]["feels_like"],
                    "humidity": data["main"]["humidity"],
                    "wind_speed": round(data["wind"]["speed"] * 3.6, 1),
                    "wind_direction": str(data["wind"].get("deg", 0)),
                    "condition": data["weather"][0]["main"],
                    "description": data["weather"][0]["description"].capitalize(),
                    "visibility_km": round(data.get("visibility", 10000) / 1000, 1),
                    "pressure_hpa": data["main"]["pressure"],
                    "location": data["name"],
                    "uv_index": 5,
                    "source": "openweathermap"
                }
    except Exception as e:
        print(f"Weather API error: {e}")
    return _mock_weather_data(location)


@router.post("/advisory")
async def weather_advisory(req: WeatherRequest):
    use_real = OPENWEATHER_API_KEY and OPENWEATHER_API_KEY != "your_openweather_api_key_here"
    weather_data = await _fetch_real_weather(req.location) if use_real else _mock_weather_data(req.location)
    advisory = await get_weather_advisory(req.location, req.planned_activities, weather_data)
    return {"success": True, "weather": weather_data, "advisory": advisory}


@router.get("/current")
async def get_current_weather(location: str = "New York"):
    use_real = OPENWEATHER_API_KEY and OPENWEATHER_API_KEY != "your_openweather_api_key_here"
    weather_data = await _fetch_real_weather(location) if use_real else _mock_weather_data(location)
    return {"success": True, "weather": weather_data}
