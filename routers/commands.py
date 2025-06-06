from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session ,joinedload
from models import Asset , User , CommandRequest
from database import get_db
from schemas import CommandRequestPost , CommandRequestResponse ,AssetMiniResponse
from utils import create_access_token, encrypt_data,decrypt_data,hash_password , verify_password
from auth import get_current_user, custom_openapi
from Command import execute_remote_command
from time import perf_counter

router = APIRouter(prefix="/command/v1", tags=["commands"])

@router.post("/command-request")
def command_request(cmd: CommandRequestPost, current_user :  dict = Depends(get_current_user), db : Session = Depends(get_db)):
    username=current_user["sub"]
    existing_user=db.query(User).filter(User.username==username).first()
    existing_asset = db.query(Asset).filter(Asset.ip==cmd.ip).filter(Asset.owner_id==existing_user.user_id).first()
    if not existing_user:
        raise HTTPException(status_code=404)
    if not existing_asset:
        raise HTTPException(status_code=400, detail=f"Asset IP:{cmd.ip} doesnt exists")
    
    start = perf_counter()
    response = execute_remote_command(hostname=cmd.ip,username=existing_asset.username,password=decrypt_data(existing_asset.password),command=cmd.command)
    end = perf_counter()

    duration_str = f"{(end - start):.2f}s"
    cmd_log = CommandRequest(command=cmd.command,output=response["output"],error=response["error"],asset_id=existing_asset.asset_id,owner_id=existing_user.user_id,status="failed" if response["error"] else "success",duration=duration_str)
    db.add(cmd_log)
    db.commit()
    if response["error"]:
        return {
            "ip": cmd.ip,
            "command": cmd.command,
            "error": response["error"]
        }
    else:
        return {
        "ip": cmd.ip,
        "command": cmd.command,
        "output": response["output"].splitlines()
        }
    
@router.get("/executions", response_model=list[CommandRequestResponse])
def get_execution_history(current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    username = current_user["sub"]
    existing_user = db.query(User).filter(User.username == username).first()

    if not existing_user:
        raise HTTPException(status_code=404, detail="User not found")

    executions = (
        db.query(CommandRequest)
        .options(
            joinedload(CommandRequest.assets_r).joinedload(Asset.group_r)
        )
        .filter(CommandRequest.owner_id == existing_user.user_id)
        .order_by(CommandRequest.created_at.desc())
        .all()
    )

    results = []
    for exec in executions:
        asset = exec.assets_r
        group = asset.group_r if asset else None

        if not asset or not group:
            continue

        results.append(
            CommandRequestResponse(
                command_id=exec.command_id,
                command=exec.command,
                status=exec.status,
                output=exec.output,
                duration=exec.duration,
                error=exec.error,
                created_at=exec.created_at,
                asset=asset.name,
                assetIp=asset.ip,
                group=group.name,
                groupColor=group.color,
            )
        )
    return results
