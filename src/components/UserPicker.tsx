import { useState } from 'react'
import { addUser, listUsers, setCurrentUser } from '../storage/progress'
import './UserPicker.css'

interface Props {
  onPick: (name: string) => void
}

export const UserPicker = ({ onPick }: Props) => {
  const [users, setUsers] = useState<string[]>(listUsers())
  const [newName, setNewName] = useState('')

  const pick = (name: string) => {
    setCurrentUser(name)
    onPick(name)
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const name = newName.trim()
    if (!name) return
    addUser(name)
    setUsers(listUsers())
    setNewName('')
    pick(name)
  }

  return (
    <div className="user-picker">
      <h2>누구세요?</h2>
      {users.length > 0 ? (
        <div className="user-list">
          {users.map((u) => (
            <button key={u} className="user-btn" onClick={() => pick(u)}>
              {u}
            </button>
          ))}
        </div>
      ) : null}
      <form onSubmit={submit} className="new-user">
        <input
          type="text"
          placeholder="새 이름"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          maxLength={20}
        />
        <button type="submit" disabled={!newName.trim()}>추가</button>
      </form>
    </div>
  )
}
