import { inject, injectable } from "tsyringe";
import { OperationType } from "../../dtos/IOperationTypeDTO";
import { IUsersRepository } from "../../../users/repositories/IUsersRepository";
import { IStatementsRepository } from "../../repositories/IStatementsRepository";
import { Statement } from "../../entities/Statement";
import { TransferStatementOperationError } from "./TransferStatementOperationError";

interface IRequest { 
  senderId: string, 
  receiverId: string, 
  amount: number, 
  description: string, 
  type: OperationType
}

@injectable()
class TransferStatementOperationUseCase {
  constructor(
    @inject("usersRepository")
    private usersRepository: IUsersRepository,

    @inject("StatementsRepository")
    private statementsRepository: IStatementsRepository
  ) {}

  async execute({ senderId, receiverId, amount, description, type}: IRequest): Promise<Statement> {
    const receiver = await this.usersRepository.findById(receiverId)

    if(!receiver) {
      throw new TransferStatementOperationError.RecipientUserNotFound()
    }

    const { balance } = await this.statementsRepository.getUserBalance({ user_id: senderId})

    if (amount > balance) {
      throw new TransferStatementOperationError.InsufficientFunds()
    }

    const statement = await this.statementsRepository.create({
      user_id: receiverId,
      sender_id: senderId,
      amount,
      description,
      type
    })

    return statement
  }
}

export { TransferStatementOperationUseCase }