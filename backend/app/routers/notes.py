from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from bson import ObjectId
from ..database import get_database
from ..dependencies import get_current_user
from ..models import NoteCreate, NoteUpdate, NotePublic

router = APIRouter(prefix="/api/notes", tags=["Notes"])


def serialize_note(note) -> NotePublic:
    return NotePublic(
        id=str(note["_id"]),
        title=note["title"],
        content=note.get("content", ""),
        color=note.get("color", "violet"),
        created_at=note["created_at"],
        updated_at=note["updated_at"],
    )


def note_filter(note_id: str, user_id: ObjectId):
    if not ObjectId.is_valid(note_id):
        raise HTTPException(status_code=404, detail="Note not found.")
    # Ownership is enforced in the database query, not just in the UI.
    return {"_id": ObjectId(note_id), "owner_id": user_id}


@router.get("", response_model=list[NotePublic])
async def list_notes(user=Depends(get_current_user)):
    cursor = get_database().notes.find({"owner_id": user["_id"]}).sort("updated_at", -1)
    return [serialize_note(note) async for note in cursor]


@router.post("", response_model=NotePublic, status_code=status.HTTP_201_CREATED)
async def create_note(payload: NoteCreate, user=Depends(get_current_user)):
    now = datetime.now(timezone.utc)
    note = {
        **payload.model_dump(),
        "owner_id": user["_id"],
        "created_at": now,
        "updated_at": now,
    }
    result = await get_database().notes.insert_one(note)
    note["_id"] = result.inserted_id
    return serialize_note(note)


@router.get("/{note_id}", response_model=NotePublic)
async def get_note(note_id: str, user=Depends(get_current_user)):
    note = await get_database().notes.find_one(note_filter(note_id, user["_id"]))
    if note is None:
        raise HTTPException(status_code=404, detail="Note not found.")
    return serialize_note(note)


@router.patch("/{note_id}", response_model=NotePublic)
async def update_note(note_id: str, payload: NoteUpdate, user=Depends(get_current_user)):
    changes = payload.model_dump(exclude_unset=True, exclude_none=True)
    if not changes:
        raise HTTPException(status_code=400, detail="Provide at least one field to update.")
    changes["updated_at"] = datetime.now(timezone.utc)
    result = await get_database().notes.update_one(
        note_filter(note_id, user["_id"]), {"$set": changes}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Note not found.")
    note = await get_database().notes.find_one(note_filter(note_id, user["_id"]))
    return serialize_note(note)


@router.delete("/{note_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_note(note_id: str, user=Depends(get_current_user)):
    result = await get_database().notes.delete_one(note_filter(note_id, user["_id"]))
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Note not found.")
