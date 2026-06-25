"""通用 Schema"""

from pydantic import BaseModel
from typing import Generic, TypeVar, List, Optional

T = TypeVar("T")


class Response(BaseModel, Generic[T]):
    """统一响应格式"""
    code: int = 0
    message: str = "success"
    data: Optional[T] = None


class PaginationParams(BaseModel):
    """分页参数"""
    page: int = 1
    page_size: int = 20


class PaginatedResponse(BaseModel, Generic[T]):
    """分页响应"""
    items: List[T]
    total: int
    page: int
    page_size: int
    total_pages: int
