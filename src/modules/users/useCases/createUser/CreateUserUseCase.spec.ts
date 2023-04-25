import { Connection, createConnection } from "typeorm";
import { app } from "../../../../app";
import request from 'supertest'
import { CreateUserUseCase } from "./CreateUserUseCase";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { ICreateUserDTO } from "./ICreateUserDTO";
import { CreateUserError } from "./CreateUserError";

let createUserUseCase: CreateUserUseCase
let userRepositoryInMemory: InMemoryUsersRepository

describe("Create user", () => {
  beforeEach(async () => {
    userRepositoryInMemory = new InMemoryUsersRepository()
    createUserUseCase = new CreateUserUseCase(userRepositoryInMemory)
  })

  it("Should be able to create a new user", async () =>{
    const userData: ICreateUserDTO = {
      name: "Fernando",
      email: "feer.otoni@hotmail.com",
      password: "1234"
    }
    const user = await createUserUseCase.execute(userData)

    expect(user).toHaveProperty("id")
    expect(user).toHaveProperty("email")
    expect(user.email).toEqual("feer.otoni@hotmail.com")
  })

  it("Should not be able to create a user with a existind email", async () => {
    expect(async () => {
      await createUserUseCase.execute({
        name: "Fernando",
        email: "feer.otoni@hotmail.com",
        password: "1234"
      })

      const response = await createUserUseCase.execute({
        name: "Fernando",
        email: "feer.otoni@hotmail.com",
        password: "1234"
      })
    }).rejects.toBeInstanceOf(CreateUserError)
  })  
})