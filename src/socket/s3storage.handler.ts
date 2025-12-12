import { FileRecordStatus } from '@/domain/fileRecord'
import { FileRepository } from '@/repositories'
import { Server, Socket } from 'socket.io'

export const s3StorageHandler = (io: Server, socket: Socket) => {
  const _userId = socket.handshake.auth.userId

  socket.on('s3storage:uploadStarted', async (fileKey: string) =>
    FileRepository.updateStatusByKey(fileKey, FileRecordStatus.pending)
  )

  socket.on('s3storage:uploadCompleted', async (fileKey: string) =>
    FileRepository.updateStatusByKey(fileKey, FileRecordStatus.uploaded)
  )

  socket.on('s3storage:uploadFailed', async (fileKey: string) =>
    FileRepository.updateStatusByKey(fileKey, FileRecordStatus.failed)
  )
}
