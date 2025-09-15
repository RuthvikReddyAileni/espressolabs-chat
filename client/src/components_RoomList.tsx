import React, { useState } from "react";

export default function RoomList({
  rooms, onCreate, onJoin,
}:{ rooms: {name:string; online:number; messages:number}[];
   onCreate:(n:string)=>void; onJoin:(n:string)=>void; }) {
  const [name, setName] = useState("general");
  return (
    <div style={{display:"flex",flexDirection:"column",gap:12}}>
      <div className="rooms">
        <input className="input" value={name} onChange={(e)=>setName(e.target.value)} placeholder="room name" />
        <button className="btn" onClick={()=>onCreate(name)}>Create</button>
        <button className="btn ghost" onClick={()=>onJoin(name)}>Join</button>
      </div>
      <div>
        <div className="side-title" style={{marginBottom:8}}>Active Rooms</div>
        <ul style={{listStyle:"none",padding:0,margin:0,display:"grid",gap:8}}>
          {rooms.map(r => (
            <li key={r.name} className="userline" style={{justifyContent:"space-between"}}>
              <div><strong>{r.name}</strong> <span className="badge">{r.online} online · {r.messages} msgs</span></div>
              <button className="btn" onClick={()=>onJoin(r.name)}>Join</button>
            </li>
          ))}
          {rooms.length === 0 && <div className="badge">No rooms yet. Create “general”.</div>}
        </ul>
      </div>
    </div>
  );
}
