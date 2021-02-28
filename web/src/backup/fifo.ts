class Fifo<T> {
    public size : number = 0;
    private first : FifoElement<T> | null = null;
    private last : FifoElement<T> | null = null;

    public push(element: T | null ) {
        if(this.size == 0){
            let e = new FifoElement(element, null);
            this.first = e;
            this.last = e;
        } else {
            let e = new FifoElement(element, null);
            this.last!.next = e;
            this.last = e;
        }

        this.size++;
    }

    public pushFifo(fifo: Fifo<T> ) {
        if(this.size == 0){
            this.first = fifo.first;
            this.last = fifo.last;
        } else {
            this.last!.next = fifo.first;
            this.last = fifo.last;
        }

        this.size += fifo.size;
    }

    public pop() : T | null {
        if(this.size == 0){
            return null;
        } else if(this.size == 1){
            let e = this.first!.element;
            this.first = null;
            this.last = null;
            this.size--;
            return e;
        } else {
            let e = this.first!.element;
            this.first = this.first!.next;
            this.size--;
            return e;
        }
    }

    public clear() {
        this.size = 0;
        this.first = null;
        this.last = null;
    }
}

class FifoElement<T> {
    public next: FifoElement<T> | null = null;
    public element: T | null = null;
    constructor(element: T | null, next: FifoElement<T> | null){
        this.element = element;
        this.next = next;
    }
}