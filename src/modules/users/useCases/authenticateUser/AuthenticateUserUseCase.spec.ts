import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase";
import { IncorrectEmailOrPasswordError } from "./IncorrectEmailOrPasswordError";

let usersRepository: InMemoryUsersRepository
let authenticateUserUseCase: AuthenticateUserUseCase
let createUserUseCase: CreateUserUseCase

describe("Authenticate user", () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository()
    createUserUseCase = new CreateUserUseCase(usersRepository)
    authenticateUserUseCase = new AuthenticateUserUseCase(usersRepository)
  })

  it("Should be able to authenticate a user", async () => {
    await createUserUseCase.execute({
      name: "Fernando",
      email: "feer.otoni@hotmail.com",
      password: "1234"
    })

    const authenticate = await authenticateUserUseCase.execute({
      email: "feer.otoni@hotmail.com",
      password: "1234"
    })

    expect(authenticate).toHaveProperty("token")
    expect(authenticate).toHaveProperty("user")
  })

  it("Should not be able to authenticate a user with incorrect email", async () => {
    expect(async () => {
      await createUserUseCase.execute({
        name: "Fernando",
        email: "feer.otoni@hotmail.com",
        password: "1234"
      })

      const authenticate = await authenticateUserUseCase.execute({
        email: "feeeeer.otoni@hotmail.com",
        password: "1234"
      })
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError)
  })

  it("Should not be able to authenticate with a not existing email", async () => {
    expect(async () => {
      const authenticate = await authenticateUserUseCase.execute({
        email: "feeeeer.otoni@hotmail.com",
        password: "1234"
      })
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError)
  })

  it("Should not be able to authenticate a user with incorrect password", async () => {
    expect(async () => {
      await createUserUseCase.execute({
        name: "Fernando",
        email: "feer.otoni@hotmail.com",
        password: "1234"
      })

      const authenticate = await authenticateUserUseCase.execute({
        email: "feer.otoni@hotmail.com",
        password: "12345"
      })
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError)
  })
})