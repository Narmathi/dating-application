// "use client";

// import { useEffect } from "react";
// import type { User } from "@/app/types/auth.d";

// export default function StoreUser({ user }: { user: User }) {
//   useEffect(() => {

//     console.log("StoreUser", user);
//     if (user) {
//       localStorage.setItem("user", JSON.stringify(user.decoded.payload));
//     }
//   }, [user]);

//   return null;
// }
