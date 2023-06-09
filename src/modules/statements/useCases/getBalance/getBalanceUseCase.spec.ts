import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { AuthenticateUserUseCase } from "../../../users/useCases/authenticateUser/AuthenticateUserUseCase";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { GetBalanceUseCase } from "./GetBalanceUseCase";

let usersRepository: InMemoryUsersRepository;
let statementsRepository: InMemoryStatementsRepository;

let createUserUseCase: CreateUserUseCase;
let authenticateUserUseCase: AuthenticateUserUseCase;
let createStatementUseCase: CreateStatementUseCase;
let getBalanceUseCase: GetBalanceUseCase;

import { OperationType } from '../../dtos/IOperationTypeDTO';
import { GetBalanceError } from "./GetBalanceError";

describe("Get balance", () => {
  beforeEach(async () => {
    usersRepository = new InMemoryUsersRepository();
    statementsRepository = new InMemoryStatementsRepository();

    createUserUseCase = new CreateUserUseCase(usersRepository);
    authenticateUserUseCase = new AuthenticateUserUseCase(usersRepository);
    createStatementUseCase = new CreateStatementUseCase(usersRepository, statementsRepository);
    getBalanceUseCase = new GetBalanceUseCase(statementsRepository, usersRepository);
  });

  it("Should be able to get the balance", async () => {
    await createUserUseCase.execute({
      email: "admin@test.com",
      password: "1234",
      name: "admin"
    });
    //cria sessao para o usuario
    const { user } = await authenticateUserUseCase.execute({
      email: "admin@test.com",
      password: "1234"
    });

    const userId = user.id ? user.id : "1";

    const typeDeposit = "deposit" as OperationType;
    const typeWithDraw = "withdraw" as OperationType;

    await createStatementUseCase.execute({
      amount: 200,
      description: "First Deposit",
      type: typeDeposit,
      user_id: userId
    });
    await createStatementUseCase.execute({
      amount: 200,
      description: "Second Deposit",
      type: typeDeposit,
      user_id: userId
    });
    await createStatementUseCase.execute({
      amount: 100,
      description: "First WithDraw",
      type: typeWithDraw,
      user_id: userId
    });

    const balance = await getBalanceUseCase.execute({ user_id: userId });

    expect(balance.balance).toEqual(300);
    expect(balance.statement).toHaveLength(3);
  })

  it("Should not be able to get balance with user which does not exists", () => {
    expect(async () => {
      const userId = "12346";

      await getBalanceUseCase.execute({ user_id: userId });
    }).rejects.toBeInstanceOf(GetBalanceError);
  })
})