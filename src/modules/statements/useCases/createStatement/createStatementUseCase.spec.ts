import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { AuthenticateUserUseCase } from "../../../users/useCases/authenticateUser/AuthenticateUserUseCase";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementUseCase } from "./CreateStatementUseCase";

let usersRepository: InMemoryUsersRepository
let statementsRepository: InMemoryStatementsRepository

let createUserUseCase: CreateUserUseCase
let authenticateUserUseCase: AuthenticateUserUseCase
let createStatementUseCase: CreateStatementUseCase

import { OperationType } from "../../dtos/IOperationTypeDTO";
import { Statement } from "../../entities/Statement";
import { CreateStatementError } from "./CreateStatementError";

describe("Create Statement", () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository()
    statementsRepository = new InMemoryStatementsRepository()

    createUserUseCase = new CreateUserUseCase(usersRepository)
    authenticateUserUseCase = new AuthenticateUserUseCase(usersRepository)
    createStatementUseCase = new CreateStatementUseCase(usersRepository, statementsRepository)
  })

  it("Should be able to create a new deposit statement", async () => {
    await createUserUseCase.execute({
      name: "admin",
      email: "admin@teste.com",
      password: "1234"
    });

    const { user } = await authenticateUserUseCase.execute({
      email: "admin@teste.com",
      password: "1234"
    });

    const userId = user.id ? user.id : "1234"
    const typeDeposit = "deposit" as OperationType

    const statement = await createStatementUseCase.execute({
      user_id: userId,
      type: typeDeposit,
      amount: 100,
      description: "Deposit"
    });

    expect(statement).toBeInstanceOf(Statement)
    expect(statement.amount).toEqual(100)
    expect(statement.description).toEqual("Deposit")
  })

  it("Should be able to create a new withdraw statement", async () => {
    await createUserUseCase.execute({
      name: "admin",
      email: "admin@teste.com",
      password: "1234"
    });

    const { user } = await authenticateUserUseCase.execute({
      email: "admin@teste.com",
      password: "1234"
    });

    const userId = user.id ? user.id : "1234"

    const typeDeposit = "deposit" as OperationType

    await createStatementUseCase.execute({
      user_id: userId,
      type: typeDeposit,
      amount: 100,
      description: "Deposit"
    })

    const typeWithdraw = "withdraw" as OperationType
    const statement = await createStatementUseCase.execute({
      user_id: userId,
      type: typeWithdraw,
      amount: 80,
      description: "Withdraw"
    })

    expect(statement).toBeInstanceOf(Statement);
    expect(statement.type).toEqual("withdraw");
    expect(statement.amount).toEqual(80);
    expect(statement.description).toEqual("WithDraw");
  })

  it("Should not be able to create a new withdraw with insufficient funds", async () => {
    expect(async () => {
      await createUserUseCase.execute({
        name: "admin",
        email: "admin@teste.com",
        password: "1234"
      });

      const { user } = await authenticateUserUseCase.execute({
        email: "admin@teste.com",
        password: "1234"
      });

      const userId = user.id ? user.id : "1234";

      //cria um deposito
      const typeDeposit = "deposit" as OperationType;
      await createStatementUseCase.execute({
        user_id: userId,
        type: typeDeposit,
        amount: 100,
        description: "Deposit"
      });

      //realiza saque
      const typeWithDraw = "withdraw" as OperationType;
      await createStatementUseCase.execute({
        user_id: userId,
        type: typeWithDraw,
        amount: 110,
        description: "WithDraw"
      });
    }).rejects.toBeInstanceOf(CreateStatementError.InsufficientFunds)
  })
})