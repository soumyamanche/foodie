import { createSlice } from "@reduxjs/toolkit";

const cartSlice = createSlice({
  name: "cart",
  initialState: {
    items: [], 
  },
  reducers: {//Reducer updates state

    //  Add item to cart =>actions {differnt items}
    //modify the state based on the action
    addItem: (state, action) => {
      const existing = state.items.find((i) => i.id === action.payload.id); //check if item is already exist
      if (existing) {
        // Item already in cart → just increase qty
        existing.qty += 1;
      } else {
        // New item → add with qty 1
        //vinilla(older redux)-don't mutate state

        //in redux toolkit 
        //we actuallu mutatae the state
        //redux uses IMMER lib(BTS) ->diff blw original and mutataed state and coming with a new state

        state.items.push({ ...action.payload, qty: 1 });
      }
    },

    // ── Remove one qty of item ──
    removeItem: (state, action) => {
      const existing = state.items.find((i) => i.id === action.payload);
      if (existing && existing.qty > 1) {
        existing.qty -= 1;
      } else {
        // qty is 1 → remove completely
        state.items = state.items.filter((i) => i.id !== action.payload);
      }
    },

    // ── Delete item completely from cart ──
    deleteItem: (state, action) => {
      state.items = state.items.filter((i) => i.id !== action.payload);
    },

    // ── Clear entire cart ──
    clearCart: (state) => {
      state.items = [];
    },
  },
});

export const { addItem, removeItem, deleteItem, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
