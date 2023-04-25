import { User } from "../../entities/User";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { AuthenticateUserUseCase } from "../authenticateUser/AuthenticateUserUseCase";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { ShowUserProfileError } from "./ShowUserProfileError";
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase";

import { v4 as uuid } from 'uuid'

let usersRepository: InMemoryUsersRepository
let createUserUseCase: CreateUserUseCase
let authenticateUserUseCase: AuthenticateUserUseCase
let showUserProfileUseCase: ShowUserProfileUseCase

describe("Show user profile", () => {
  beforeEach(async () => {
    usersRepository = new InMemoryUsersRepository()
    createUserUseCase = new CreateUserUseCase(usersRepository)
    authenticateUserUseCase = new AuthenticateUserUseCase(usersRepository)
    showUserProfileUseCase = new ShowUserProfileUseCase(usersRepository)
  })

  it("Should be able to show user profile info", async () => {
    await createUserUseCase.execute({
      name: "Fernando",
      email: "feer.otoni@hotmail.com",
      password: "1234"
    })

    const { user } = await authenticateUserUseCase.execute({
      email: "feer.otoni@hotmail.com",
      password: "1234"
    })

    const id = user.id ? user.id : uuid()

    const userProfile = await showUserProfileUseCase.execute(id)

    expect(userProfile).toBeInstanceOf(User)
    expect(userProfile.id).toEqual(id)
    expect(userProfile.name).toEqual("Fernando")
    expect(userProfile.email).toEqual("feer.otoni@hotmail.com")
  })

  it("Should not be able to show user profile info with not exists id", async () => {
    expect(async () => {
      const id = uuid()
      await showUserProfileUseCase.execute(id)
    }).rejects.toBeInstanceOf(ShowUserProfileError)
  })
})