export default class Event {
   constructor(public event: string, public execute: Function) {
      this.event = event
      this.execute = execute
   }
}
