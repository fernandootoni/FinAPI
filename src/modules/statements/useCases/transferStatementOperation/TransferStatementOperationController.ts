import { Request, Response } from "express";
import { OperationType } from "../../dtos/IOperationTypeDTO";
import { container } from "tsyringe";
import { TransferStatementOperationUseCase } from "./TransferStatementOperationUseCase";

class TransferStatementOperationController {
  async handle(request: Request, response: Response): Promise<Response> {
    const { id: senderId } = request.user
    const { receiverId } = request.params
    const { amount, description } = request.body
    const type = 'transfer' as OperationType

    const transferStatementOperationUseCase = container.resolve(TransferStatementOperationUseCase)

    const statement = await transferStatementOperationUseCase.execute({ senderId, receiverId, amount, description, type})

    return response.status(201).json(statement)
  }
}

export { TransferStatementOperationController }