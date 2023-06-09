import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository"
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { TransferStatementOperationUseCase } from "./TransferStatementOperationUseCase";
import { v4 as uuidV4 } from 'uuid';

import { OperationType } from '../../dtos/IOperationTypeDTO'
import { Statement } from "../../entities/Statement";
import { TransferStatementOperationError } from "./TransferStatementOperationError";

let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let transferStatementOperationUseCase: TransferStatementOperationUseCase;

const type = "transfer" as OperationType;

describe('Transfer Statement Operation', () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryStatementsRepository = new InMemoryStatementsRepository();

    transferStatementOperationUseCase = new TransferStatementOperationUseCase(inMemoryUsersRepository, inMemoryStatementsRepository);
  });

  it("Should be able to do a transfer", async () => {
    const { id: senderId } = await inMemoryUsersRepository.create({
      email: "sender@test.com",
      name: "sender",
      password: "1234"
    });

    const { id: receiverId } = await inMemoryUsersRepository.create({
      email: "recipient@test.com",
      name: "recipient",
      password: "12345"
    });

    //faz um deposito para ter fundos
    await inMemoryStatementsRepository.create({
      user_id: String(senderId),
      amount: 200,
      description: "Test Deposit",
      type: "deposit" as OperationType
    });

    const statement = await transferStatementOperationUseCase.execute({
      senderId: String(senderId),
      receiverId: String(receiverId),
      amount: 100,
      description: "Test Transfer",
      type
    });

    expect(statement).toBeInstanceOf(Statement);
    expect(statement).toHaveProperty('sender_id');
    expect(statement.sender_id).toEqual(senderId);
  });

  it("Should not be able to do a transfer to a user which does not exists", async () => {
    const { id: senderId } = await inMemoryUsersRepository.create({
      email: "sender@test.com",
      name: "sender",
      password: "1234"
    });

    const receiverId = uuidV4();

    expect(async () => {
      await transferStatementOperationUseCase.execute({
        senderId: String(senderId),
        receiverId: String(receiverId),
        amount: 100,
        description: "Test Transfer",
        type
      })
    }).rejects.toBeInstanceOf(TransferStatementOperationError.RecipientUserNotFound);
  });

  it("Should not be able to Transfer without funds", async () => {
    const { id: senderId } = await inMemoryUsersRepository.create({
      email: "sender@test.com", name: "sender", password: "1234"
    });

    const { id: recipientId } = await inMemoryUsersRepository.create({
      email: "recipient@test.com", name: "recipient", password: "1234"
    });

    expect(async () => {
      await transferStatementOperationUseCase.execute({
        amount: 50,
        description: "Transfer Without Funds Test",
        receiverId: String(recipientId),
        senderId: String(senderId),
        type
      })
    }).rejects.toBeInstanceOf(TransferStatementOperationError.InsufficientFunds);
  })

})
