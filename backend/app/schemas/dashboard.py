from pydantic import BaseModel


class ContractorDashboard(BaseModel):
    total_projects: int
    open_projects: int
    in_progress_projects: int
    completed_projects: int
    total_orders: int
    pending_quotes: int


class SubcontractorDashboard(BaseModel):
    total_quotes: int
    accepted_quotes: int
    active_orders: int
    completed_orders: int
    average_rating: float | None = None
