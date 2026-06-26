"""身份证号 AES-256 加密/解密工具

使用 Fernet (AES-256-CBC + HMAC-SHA256) 对身份证号进行加密存储。
加密密钥由 SECRET_KEY 派生而来，确保密钥一致性。
"""

from cryptography.fernet import Fernet
import base64
import hashlib
from app.core.config import settings


def _get_fernet() -> Fernet:
    """从 SECRET_KEY 派生 Fernet 加密密钥"""
    # Fernet 需要 32 字节的 url-safe base64 密钥
    key_bytes = hashlib.sha256(settings.SECRET_KEY.encode("utf-8")).digest()
    fernet_key = base64.urlsafe_b64encode(key_bytes)
    return Fernet(fernet_key)


def encrypt_id_card(id_card: str) -> str:
    """加密身份证号，返回加密后的字符串（base64）"""
    if not id_card:
        return ""
    f = _get_fernet()
    return f.encrypt(id_card.encode("utf-8")).decode("utf-8")


def decrypt_id_card(encrypted_id_card: str) -> str:
    """解密身份证号，返回明文"""
    if not encrypted_id_card:
        return ""
    f = _get_fernet()
    return f.decrypt(encrypted_id_card.encode("utf-8")).decode("utf-8")
