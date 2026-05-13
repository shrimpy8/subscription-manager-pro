import { Subscription } from '@/types/subscription'
import { sampleSubscriptions } from '@/lib/sample-data'

let subscriptions: Subscription[] = [...sampleSubscriptions]

export function getSubscriptions(): Subscription[] {
  return subscriptions
}

export function setSubscriptions(subs: Subscription[]): void {
  subscriptions = subs
}

export function findSubscription(id: string): Subscription | undefined {
  return subscriptions.find(sub => sub.id === id)
}

export function findSubscriptionIndex(id: string): number {
  return subscriptions.findIndex(sub => sub.id === id)
}

export function addSubscription(sub: Subscription): void {
  subscriptions.push(sub)
}

export function removeSubscription(index: number): Subscription {
  return subscriptions.splice(index, 1)[0]
}

export function updateSubscription(index: number, sub: Subscription): void {
  subscriptions[index] = sub
}
