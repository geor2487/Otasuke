import uuid

import boto3
from botocore.config import Config

from app.config import settings


def get_s3_client():
    return boto3.client(
        "s3",
        endpoint_url=settings.S3_ENDPOINT_URL,
        aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
        aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
        region_name=settings.AWS_REGION,
        config=Config(signature_version="s3v4"),
    )


def upload_file(
    file_content: bytes,
    file_name: str,
    content_type: str = "application/octet-stream",
) -> str:
    s3 = get_s3_client()
    key = f"uploads/{uuid.uuid4().hex}/{file_name}"
    s3.put_object(
        Bucket=settings.S3_BUCKET_NAME,
        Key=key,
        Body=file_content,
        ContentType=content_type,
    )
    return f"{settings.S3_ENDPOINT_URL}/{settings.S3_BUCKET_NAME}/{key}"


def generate_presigned_url(key: str, expiration: int = 3600) -> str:
    s3 = get_s3_client()
    return s3.generate_presigned_url(
        "get_object",
        Params={"Bucket": settings.S3_BUCKET_NAME, "Key": key},
        ExpiresIn=expiration,
    )
