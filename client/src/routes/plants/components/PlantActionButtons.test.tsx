import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import PlantActionButtons from "./PlantActionButtons"

describe("PlantActionButtons", () => {
  it("calls onAction with trimmed note and selected type", async () => {
    const onAction = vi.fn().mockResolvedValue(undefined)

    render(<PlantActionButtons plantId={42} onAction={onAction} />)

    fireEvent.click(screen.getByLabelText("ПОЛИВ"))
    fireEvent.change(screen.getByPlaceholderText("Заметка"), {
      target: { value: "   Полил утром  " },
    })
    fireEvent.click(screen.getByRole("button", { name: /добавить/i }))

    await waitFor(() => {
      expect(onAction).toHaveBeenCalledWith({
        plantId: 42,
        type: "ПОЛИВ",
        note: "Полил утром",
      })
    })
  })

  it("does not call onAction when type is not selected", async () => {
    const onAction = vi.fn()

    render(<PlantActionButtons plantId={7} onAction={onAction} />)

    fireEvent.change(screen.getByPlaceholderText("Заметка"), {
      target: { value: "Заметка" },
    })
    fireEvent.click(screen.getByRole("button", { name: /добавить/i }))

    await waitFor(() => {
      expect(onAction).not.toHaveBeenCalled()
    })
  })
})
