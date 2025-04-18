// menu-split-app
// Uitgebreide versie met mogelijkheid om meerdere stuks per item te selecteren en vrienden toe te voegen of te verwijderen.

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const exampleOCRText = `Cola 2.50\nPils 2.80\nWitte wijn 4.00\nSpa rood 2.20\nKoffie 3.00`;

import { useEffect } from "react";

export default function MenuSplitApp() {
  const [menuText, setMenuText] = useState(exampleOCRText);
  const [imageFile, setImageFile] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [selections, setSelections] = useState({});
  const [friends, setFriends] = useState([]);
  const [newFriend, setNewFriend] = useState("");
  const [payer, setPayer] = useState("");

  const parseMenu = () => {
    const lines = menuText.split("\n");
    const items = lines.map((line) => {
      const match = line.match(/(.+)\s(\d+[\.,]?\d{0,2})/);
      if (match) return { item: match[1], price: parseFloat(match[2].replace(",", ".")) };
      return null;
    }).filter(Boolean);
    setMenuItems(items);
  };

  const addItemForFriend = (friend, item) => {
    setSelections((prev) => {
      const current = prev[friend] || {};
      const count = current[item.item] || 0;
      return {
        ...prev,
        [friend]: {
          ...current,
          [item.item]: count + 1
        }
      };
    });
  };

  const removeItemForFriend = (friend, item) => {
    setSelections((prev) => {
      const current = prev[friend] || {};
      const count = current[item.item] || 0;
      if (count <= 0) return prev;
      return {
        ...prev,
        [friend]: {
          ...current,
          [item.item]: count - 1
        }
      };
    });
  };

  const calculateTotals = () => {
    const totals = {};
    friends.forEach((friend) => {
      const items = selections[friend] || {};
      const total = Object.entries(items).reduce((sum, [itemName, count]) => {
        const found = menuItems.find((i) => i.item === itemName);
        return sum + (found ? found.price * count : 0);
      }, 0);
      totals[friend] = total.toFixed(2);
    });
    return totals;
  };

  const handleAddFriend = () => {
    if (newFriend && !friends.includes(newFriend)) {
      setFriends([...friends, newFriend]);
      setNewFriend("");
    }
  };

  const handleRemoveFriend = (friendToRemove) => {
    setFriends((prev) => prev.filter((f) => f !== friendToRemove));
    setSelections((prev) => {
      const updated = { ...prev };
      delete updated[friendToRemove];
      return updated;
    });
    if (payer === friendToRemove && friends.length > 1) {
      setPayer(friends.find((f) => f !== friendToRemove));
    }
  };

  const totals = calculateTotals();

  useEffect(() => {
    parseMenu();
  }, []);

  return (
    <div className="p-4 max-w-3xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">🍽️ Menu Split App</h1>

      <Card>
        <CardContent className="p-4 space-y-2">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files[0])}
          />
          <Textarea
            value={menuText}
            onChange={(e) => setMenuText(e.target.value)}
            placeholder="Plak hier de OCR-resultaten van de menukaart"
          />
          <Button onClick={parseMenu}>Menu inladen</Button>
          {imageFile && (
            <p className="text-sm">Geselecteerde afbeelding: {imageFile.name}</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 space-y-2">
          <div className="flex gap-2">
            <Input
              value={newFriend}
              onChange={(e) => setNewFriend(e.target.value)}
              placeholder="Nieuwe vriend toevoegen"
            />
            <Button onClick={handleAddFriend}>Toevoegen</Button>
          </div>

          <label className="block text-sm font-medium">Selecteer betaler:</label>
          <select disabled={friends.length === 0} className="w-full border rounded px-2 py-1" value={payer} onChange={(e) => setPayer(e.target.value)}>
            <option value="">-- Kies een vriend --</option>
            {friends.map((friend) => (
              <option key={friend} value={friend}>{friend}</option>
            ))}
          </select>
        </CardContent>
      </Card>

      {menuItems.length > 0 && (
        <div className="space-y-4">
          {friends.map((friend) => (
            <Card key={friend}>
              <CardContent className="p-4 space-y-2">
                <div className="flex justify-between items-center">
                  <h2 className="font-semibold text-lg">{friend}</h2>
                  <Button variant="outline" onClick={() => handleRemoveFriend(friend)}>
                    Verwijder
                  </Button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                  {menuItems.map((item) => (
                    <div key={item.item} className="flex items-center justify-between gap-2 border p-2 rounded-md">
                      <span>{item.item} (€{item.price.toFixed(2)})</span>
                      <div className="flex items-center gap-1">
                        <Button variant="outline" onClick={() => removeItemForFriend(friend, item)}>-</Button>
                        <span>{selections[friend]?.[item.item] || 0}</span>
                        <Button onClick={() => addItemForFriend(friend, item)}>+</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}

          <Card>
            <CardContent className="p-4">
              <h2 className="text-lg font-semibold">💸 Terugbetaling</h2>
              <p>Betaler: <strong>{payer}</strong></p>
              <div className="space-y-1 mt-2">
                {Object.entries(totals).map(([name, total]) => (
                  name !== payer && (
                    <p key={name}>{name} moet €{total} betalen aan {payer}</p>
                  )
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
