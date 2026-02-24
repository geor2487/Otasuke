import enum


class UserRole(str, enum.Enum):
    CONTRACTOR = "contractor"  # 元請け
    SUBCONTRACTOR = "subcontractor"  # 下請け


class ProjectStatus(str, enum.Enum):
    DRAFT = "draft"
    OPEN = "open"
    CLOSED = "closed"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class QuoteStatus(str, enum.Enum):
    SUBMITTED = "submitted"
    ACCEPTED = "accepted"
    REJECTED = "rejected"
    WITHDRAWN = "withdrawn"


class OrderStatus(str, enum.Enum):
    CONFIRMED = "confirmed"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class DirectOrderStatus(str, enum.Enum):
    PENDING = "pending"
    ACCEPTED = "accepted"
    DECLINED = "declined"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class NotificationType(str, enum.Enum):
    QUOTE_RECEIVED = "quote_received"
    QUOTE_ACCEPTED = "quote_accepted"
    QUOTE_REJECTED = "quote_rejected"
    ORDER_CONFIRMED = "order_confirmed"
    ORDER_COMPLETED = "order_completed"
    REVIEW_RECEIVED = "review_received"
    PROJECT_UPDATED = "project_updated"
    DIRECT_ORDER_RECEIVED = "direct_order_received"
    DIRECT_ORDER_ACCEPTED = "direct_order_accepted"
    DIRECT_ORDER_DECLINED = "direct_order_declined"
    DIRECT_ORDER_COMPLETED = "direct_order_completed"
    DIRECT_ORDER_CANCELLED = "direct_order_cancelled"
