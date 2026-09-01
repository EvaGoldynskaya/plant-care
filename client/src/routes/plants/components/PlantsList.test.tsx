import { fireEvent, render, screen } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { beforeEach, describe, expect, it, vi } from "vitest"
import PlantsList from "./PlantsList"
import plantStore from "../../../store/plantStore"
import roomStore from "../../../store/roomStore"

const navigateMock = vi.fn()

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>(
    "react-router-dom"
  )

  return {
    ...actual,
    useNavigate: () => navigateMock,
  }
})

describe("PlantsList", () => {
  beforeEach(() => {
    navigateMock.mockClear()
    Object.assign(plantStore, {
      plants: [
        {
          id: 1,
          commonName: "Rose",
          name: "Роза",
          userId: 3,
          plantbookPid: "pid-1",
          roomId: 2,
          createdAt: "2024-01-01T00:00:00.000Z",
          updatedAt: "2024-01-02T00:00:00.000Z",
          actions: [],
          lastAction: {
            id: 9,
            type: "ПОЛИВ",
            note: "Полито",
            createdAt: "2024-01-03T00:00:00.000Z",
          },
          plantbook: {} as any,
        },
      ],
      page: 1,
      limit: 10,
      total: 1,
      plantIsLoading: false,
      changePage: vi.fn(),
    })

    Object.assign(roomStore, {
      getRoomName: vi.fn(() => "Спальня"),
    })
  })

  it("renders plant items and navigates to detail page on click", () => {
    render(
      <MemoryRouter>
        <PlantsList formatDate={value => value} />
      </MemoryRouter>
    )

    expect(screen.getByText("Роза - Rose")).toBeTruthy()
    expect(screen.getByText(/Последний полив/i)).toBeTruthy()

    fireEvent.click(screen.getByText("Роза - Rose"))

    expect(navigateMock).toHaveBeenCalledWith("/plants/1")
  })
})
