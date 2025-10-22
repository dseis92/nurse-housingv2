import { create } from 'zustand'
type State = { favs: Record<string,true>; toggle:(id:string)=>void; isFav:(id:string)=>boolean; clear:()=>void }
export const useFavStore = create<State>((set,get)=>({
  favs:{},
  toggle:(id)=>set(s=>{const n={...s.favs}; n[id]?delete n[id]:n[id]=true; return {favs:n}}),
  isFav:(id)=>!!get().favs[id],
  clear:()=>set({favs:{}})
}))
