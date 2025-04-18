
// React + Tailwind versie van de Menu Split App
import React, { useState, useEffect } from "react";

const exampleOCRText = `Cola 2.50\nPils 2.80\nWitte wijn 4.00\nSpa rood 2.20\nKoffie 3.00`;

export default function MenuSplitApp() {
  const [menuText, setMenuText] = useState(exampleOCRText);
  const [menuItems, setMenuItems] = useState([]);
  const [friends, setFriends] = useState([]);
  const [selections, setSelections] = useState({});
  const [payer, setPayer] = useState("");
  const [newFriend, setNewFriend] = useState("");

  useEffect(() => {
    parseMenu();
  }, []);

  const parseMenu = () => {
    const lines = menuText.split("\n");
    const items = lines.map((line) => {
      const match = line.match(/(.+)\s(\d+[\.,]?\d{0,2})/);
      return match ? { item: match[1], price: parseFloat(match[2].replace(",", ".")) } : null;
    }).filter(Boolean);
    setMenuItems(items);
  };

  const addFriend = () => {
    if (newFriend && !friends.includes(newFriend)) {
      setFriends([...friends, newFriend]);
      setSelections({ ...selections, [newFriend]: {} });
      if (!payer) setPayer(newFriend);
      setNewFriend("");
    }
  };

  const removeFriend = (name) => {
    const updatedFriends = friends.filter((f) => f !== name);
    const updatedSelections = { ...selections };
    delete updatedSelections[name];
    setFriends(updatedFriends);
    setSelections(updatedSelections);
    if (payer === name) setPayer(updatedFriends[0] || "");
  };

  const toggleItem = (friend, item, change) => {
    const friendSelections = selections[friend] || {};
    const current = friendSelections[item] || 0;
    const updated = Math.max(0, current + change);
    setSelections({
      ...selections,
      [friend]: { ...friendSelections, [item]: updated },
    });
  };

  const calculateTotals = () => {
    const totals = {};
    friends.forEach((friend) => {
      const items = selections[friend] || {};
      totals[friend] = Object.entries(items).reduce((sum, [item, qty]) => {
        const found = menuItems.find((m) => m.item === item);
        return sum + (found ? found.price * qty : 0);
      }, 0);
    });
    return totals;
  };

  const totals = calculateTotals();

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-6">
      <h1 className="text-3xl font-bold">🍽️ Menu Split App</h1>

      <div className="border p-4 rounded-lg space-y-2">
        <label className="font-medium">Menukaart (tekst)</label>
        <textarea
          className="w-full border rounded p-2"
          rows="4"
          value={menuText}
          onChange={(e) => setMenuText(e.target.value)}
        ></textarea>
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          onClick={parseMenu}
        >
          Menu inladen
        </button>
      </div>

      <div className="border p-4 rounded-lg space-y-2">
        <label className="font-medium">Nieuwe vriend toevoegen</label>
        <input
          className="w-full border rounded p-2"
          value={newFriend}
          onChange={(e) => setNewFriend(e.target.value)}
          placeholder="Naam vriend"
        />
        <button
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          onClick={addFriend}
        >
          Toevoegen
        </button>
        <div>
          <label className="block mt-2">Betaler:</label>
          <select
            className="w-full border rounded p-2"
            value={payer}
            onChange={(e) => setPayer(e.target.value)}
          >
            {friends.map((f) => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
        </div>
      </div>

      {friends.map((friend) => (
        <div key={friend} className="border p-4 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-xl font-semibold">{friend}</h2>
            <button
              className="text-red-500 hover:underline"
              onClick={() => removeFriend(friend)}
            >
              Verwijder
            </button>
          </div>
          {menuItems.map((item) => {
            const qty = selections[friend]?.[item.item] || 0;
            return (
              <div
                key={item.item}
                className="flex justify-between items-center border-b py-2"
              >
                <span>{item.item} (€{item.price.toFixed(2)})</span>
                <div className="flex gap-2 items-center">
                  <button
                    className="border px-2 rounded"
                    onClick={() => toggleItem(friend, item.item, -1)}
                  >
                    -
                  </button>
                  <span>{qty}</span>
                  <button
                    className="border px-2 rounded"
                    onClick={() => toggleItem(friend, item.item, 1)}
                  >
                    +
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ))}

      <div className="border p-4 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">💸 Terugbetaling</h2>
        {friends.filter((f) => f !== payer).map((f) => (
          <p key={f}>{f} moet €{totals[f].toFixed(2)} betalen aan {payer}</p>
        ))}
      </div>
    </div>
  );
}
