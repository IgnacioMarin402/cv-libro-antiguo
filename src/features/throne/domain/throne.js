import { TABLE_SURFACE_Y, TABLE_FOOT_Y } from '@/features/table'

// The throne pulled up to the table: a carved high-backed chair, a mesh
// generated in Tripo like the table and not built in code (see Throne.jsx).

// The model exports 45.9 wide, 97.7 tall and 49.1 deep, standing on y = 0
// and facing +z. Its cushion tops out at 47.0 in the middle of the seat; the
// arms run at 44 and the back rises to 97.7 (measured by raycasting it).
const MODEL_SEAT_Y = 47.0

// Sized against the table it's drawn up to, since that's what it's seen
// beside: the seat 30 cm under the cloth, the usual drop from a table top to
// a chair's. The table stands 1.01 m tall (see features/table), so that puts
// the seat 71 cm off the floor — a throne's raised seat — the back 1.47 m
// and the arms 69 cm apart. Sized for a person instead (seat at 47 cm) it
// came out a 98 cm chair, the table top at its sitter's chin.
const SEAT_BELOW_TABLE = 0.3
export const THRONE_SCALE = (TABLE_SURFACE_Y - SEAT_BELOW_TABLE - TABLE_FOOT_Y) / MODEL_SEAT_Y
