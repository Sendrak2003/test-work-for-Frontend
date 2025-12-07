import type { DeletionTimer } from '@/entities/task'

/**
 * Сервис для управления таймерами удаления задач
 */
export class TaskDeletionService {
  private timers: Map<number, DeletionTimer> = new Map()
  private pendingIds: Set<number> = new Set()
  private readonly DELETION_DELAY = 5 // секунд

  /**
   * Начать процесс удаления задачи
   */
  startDeletion(
    taskId: number,
    onComplete: (taskId: number) => void
  ): void {
    this.pendingIds.add(taskId)

    const timerId = window.setInterval(() => {
      const timer = this.timers.get(taskId)
      if (!timer) return

      timer.timeLeft--

      if (timer.timeLeft <= 0) {
        this.cleanup(taskId)
        onComplete(taskId)
      }
    }, 1000)

    this.timers.set(taskId, {
      timerId,
      timeLeft: this.DELETION_DELAY
    })
  }

  /**
   * Отменить удаление задачи
   */
  cancelDeletion(taskId: number): void {
    this.cleanup(taskId)
  }

  /**
   * Очистить таймер для задачи
   */
  private cleanup(taskId: number): void {
    this.pendingIds.delete(taskId)

    const timer = this.timers.get(taskId)
    if (timer) {
      clearInterval(timer.timerId)
      this.timers.delete(taskId)
    }
  }

  /**
   * Проверить, находится ли задача в процессе удаления
   */
  isPending(taskId: number): boolean {
    return this.pendingIds.has(taskId)
  }

  /**
   * Получить оставшееся время до удаления
   */
  getTimeLeft(taskId: number): number {
    return this.timers.get(taskId)?.timeLeft ?? this.DELETION_DELAY
  }

  /**
   * Очистить все таймеры
   */
  dispose(): void {
    this.timers.forEach(timer => {
      clearInterval(timer.timerId)
    })
    this.timers.clear()
    this.pendingIds.clear()
  }
}

