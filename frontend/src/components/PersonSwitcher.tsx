import { useState, type FormEvent } from "react";
import { usePeople, useCreatePerson } from "../api/chores";
import { usePersonContext } from "../context/PersonContext";

export function PersonSwitcher() {
  const { data: people } = usePeople();
  const { currentPersonId, setCurrentPersonId } = usePersonContext();
  const createPerson = useCreatePerson();
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState("");

  const handleAdd = async (e: FormEvent) => {
    e.preventDefault();
    const name = newName.trim();
    if (!name) return;
    const person = await createPerson.mutateAsync(name);
    setCurrentPersonId(person.id);
    setNewName("");
    setIsAdding(false);
  };

  if (isAdding) {
    return (
      <form className="person-switcher-add" onSubmit={handleAdd}>
        <input
          autoFocus
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Your name"
        />
        <button type="submit">Add</button>
        <button type="button" onClick={() => setIsAdding(false)}>
          Cancel
        </button>
      </form>
    );
  }

  return (
    <div className="person-switcher">
      <label>
        I am:{" "}
        <select
          value={currentPersonId ?? ""}
          onChange={(e) => {
            if (e.target.value === "__new__") {
              setIsAdding(true);
              return;
            }
            setCurrentPersonId(e.target.value ? Number(e.target.value) : null);
          }}
        >
          <option value="">Select person…</option>
          {people?.map((person) => (
            <option key={person.id} value={person.id}>
              {person.name}
            </option>
          ))}
          <option value="__new__">+ Add person…</option>
        </select>
      </label>
    </div>
  );
}
