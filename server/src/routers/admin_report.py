from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, Security
from fastapi.responses import FileResponse, ORJSONResponse
from fastapi.security.api_key import APIKeyHeader
from src.config import settings
from src.schemas.admin_report import ReportInput
from src.schemas.report import Report
from src.services.report_launcher import launch_report_generation
from src.services.report_status import load_status_as_reports
from src.utils.logger import setup_logger

ROOT_DIR = Path(__file__).parent.parent.parent.parent

slogger = setup_logger()
router = APIRouter()


api_key_header = APIKeyHeader(name="x-api-key", auto_error=False)


async def verify_admin_api_key(api_key: str = Security(api_key_header)):
    if not api_key or api_key != settings.ADMIN_API_KEY:
        raise HTTPException(status_code=401, detail="Invalid API key")
    return api_key


@router.get("/admin/reports")
async def get_reports(api_key: str = Depends(verify_admin_api_key)) -> list[Report]:
    return load_status_as_reports()


@router.post("/admin/reports", status_code=202)
async def create_report(report: ReportInput, api_key: str = Depends(verify_admin_api_key)):
    try:
        launch_report_generation(report)

        return ORJSONResponse(
            content=None,
            headers={
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
            },
        )
    except ValueError as e:
        slogger.error(f"ValueError: {e}", exc_info=True)
        raise HTTPException(status_code=400, detail=str(e)) from e
    except Exception as e:
        slogger.error(f"Exception: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal server error") from e


@router.get("/get-csv/{slug}")
async def get_csv(slug: str, api_key: str = Depends(verify_admin_api_key)):
    csv_path = settings.REPORT_DIR / slug / "final_result_with_comments.csv"
    if not csv_path.exists():
        raise HTTPException(status_code=404, detail="CSV file not found")

    return FileResponse(path=str(csv_path), media_type="text/csv", filename=f"kouchou_{slug}.csv")
