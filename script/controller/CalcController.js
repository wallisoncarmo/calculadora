class CalcController {

    constructor() {
        this._lastOperator = "";
        this._lastNumber = "";
        this._audioOnOff = false;
        this._audio = new Audio('click.mp3');

        this._operation = [];
        this._locale = 'pt-BR';
        this._displayCalcEl = document.querySelector("#display");
        this._dateEl = document.querySelector("#data");
        this._timeEl = document.querySelector("#hora");

        this.initialize();
        this.initButtonsEvents();
        this.initKeyboard();
    }

    /**
     * inicia a calculadora
     */
    initialize() {
        this.setDisplayDateTime();
        setInterval(() => {
            this.setDisplayDateTime();
        }, 1000);

        this.lastNumberToDisplay();
        this.pasteFromClipBoard();

        document.querySelectorAll('.btn-ac').forEach(btn => {
            btn.addEventListener('dblclick', e => {
                this.toggleAudio();
            });
        })
    }

    /**
     * liga e desliga o audio
     */
    toggleAudio() {
        this._audioOnOff = !this._audioOnOff;
    }

    playAudio() {
        if (this._audioOnOff) {
            this._audio.currentTime = 0;
            this._audio.play();
        }
    }

    /**
     * Copia o valor do display da calculadora
     */
    copyToClipBoard() {

        let input = document.createElement('input');

        input.value = this.displayCalc;

        document.body.appendChild(input);

        input.select();

        document.execCommand('Copy');

        input.remove();
    }

    /**
     * cola um valor a calculadora
     */
    pasteFromClipBoard() {
        document.addEventListener('paste', e => {
            let text = e.clipboardData.getData('text');
            if (!isNaN(text)) {
                this.addOperation(parseFloat(text));
            } else {
                this.setErros();
            }
        })
    }

    /**
     * recupera os valores digitados no teclado
     */
    initKeyboard() {
        document.addEventListener('keyup', e => {

            this.playAudio();

            switch (e.key) {
                case "Escape":
                    this.clearAll()
                    break;
                case "Backspace":
                    this.clearEntry();
                    break;
                case "+":
                case "-":
                case "*":
                case "/":
                case "%":
                    this.addOperation(e.key);
                    break;
                case "Enter":
                case "=":
                    this.calc();
                    break;
                case ",":
                case ".":
                    this.addDot(".");
                    break;
                case "0":
                case "1":
                case "2":
                case "3":
                case "4":
                case "5":
                case "6":
                case "7":
                case "8":
                case "9":
                    this.addOperation(parseInt(e.key));
                    break;
                case "c":
                    if (e.ctrlKey) this.copyToClipBoard();
                    break
                case "v":
                    if (e.ctrlKey) this.pasteFromClipBoard();
                    break
            }
        });
    }

    /**
     * limpa calculadora
     */
    clearAll() {
        this._operation = [];
        this._lastNumber = "";
        this._lastOperator = "";
        this.lastNumberToDisplay();
    }

    /**
     * limpa o ultimo item da calculadora
     */
    clearEntry() {
        this._operation.pop();
        this.lastNumberToDisplay();
    }

    /**
     * recupera o ultima item da lista
     */
    getLastOpertation() {
        return this._operation[this._operation.length - 1];
    }

    /**
     * insere um valor no ultimo item da lista
     * @param {number} value 
     */
    setLastOpertation(value) {
        return this._operation[this._operation.length - 1] = value;
    }

    /**
     * verifica se foi informado um operador logico
     * @param {string} value 
     */
    isOperator(value) {
        return (['+', "-", "/", "*", "%"].indexOf(value) > -1);
    }

    /**
     * adiciona o operador e calcula
     * @param {string} value 
     */
    pushOperator(value) {
        this._operation.push(value);
        if (this._operation.length > 3) {
            this.calc();
        }
    }

    /**
     * executa a operação da calculadora
     */
    getResult() {

        try {
            return eval(this._operation.join(""));
        } catch (error) {
            setTimeout(()=>{
                this.setErros();
            },1);            
        }            
    }

    /**
     * controla as regras da calculadora
     */
    calc() {
        let last = '';

        this._lastOperator = this.getLastItem();


        if (this._operation.length < 3) {
            let firstItem = this._operation[0];
            this._operation = [firstItem, this._lastOperator, this._lastNumber];
        }

        if (this._operation.length > 3) {

            last = this._operation.pop();
            this._lastNumber = this.getResult();

        } else if (this._operation.length == 3) {
            this._lastNumber = this.getLastItem(false);
        }

        console.log("operador", this._lastOperator);
        console.log("numero", this._lastNumber);

        let result = this.getResult();

        if (last == "%") {
            result /= 100;
            this._operation = [result];
        } else {
            this._operation = [result];

            if (last) this._operation.push(last);
        }

        this.lastNumberToDisplay();

    }

    /**
     * recupera o ultimo item da calculadora, é preciso informar se quer um operador ou numero
     * @param {boolean} isOperator 
     */
    getLastItem(isOperator = true) {

        let lastItem;

        for (let i = this._operation.length - 1; i >= 0; i--) {

            if (this.isOperator(this._operation[i]) == isOperator) {
                lastItem = this._operation[i];
                break;
            }

        }

        if (!lastItem) {
            lastItem = (isOperator) ? this._lastOperator : this._lastNumber;
        }


        return lastItem;

    }

    /**
     * Exibe o ultimo numero na tela da calculadora
     */
    lastNumberToDisplay() {
        let lastNumber = this.getLastItem(false);

        if (!lastNumber) lastNumber = 0;
        this.displayCalc = lastNumber;
    }

    /**
     * regra para adicionar um operador ou numero
     * @param {string} value 
     */
    addOperation(value) {

        let last = this.getLastOpertation();

        if (isNaN(last)) {
            if (this.isOperator(value)) {
                // subistitui uma nova operacao
                this.setLastOpertation(value);
            } else {
                // adiciona uma nova operacao
                this.pushOperator(value);
                this.lastNumberToDisplay();
            }

        } else {
            if (this.isOperator(value)) {
                // adiciona uma nova operacao
                this.pushOperator(value);
            } else {
                // adiciona um numero concatenado
                let newValue = last.toString() + value.toString();
                this.setLastOpertation(newValue);

                this.lastNumberToDisplay();

            }

        }
    }

    /**
     * exibe os erros da calculadora
     */
    setErros() {
        this.displayCalc = "Error";
    }

    /**
     * adiciona o ponto
     */
    addDot() {
        let lastOperation = this.getLastOpertation();

        if (typeof lastOperation === 'string' && lastOperation.split('').indexOf('.') > -1) return;

        if (this.isOperator(lastOperation) || !lastOperation) {
            this.pushOperator('0.');
        } else {
            this.setLastOpertation(lastOperation.toString() + '.');
        }

        this.lastNumberToDisplay();
    }

    /**
     * adiciona uma lista de eventos aos botões
     * @param {string} element 
     * @param {string} events 
     * @param {function} fn 
     */
    addEventListenerAll(element, events, fn) {
        events.split(" ").forEach(event => {
            element.addEventListener(event, fn);
        });
    }

    /**
     * executa uma função do botão dependendo o seu tipo
     * @param {string} value 
     */
    execBtn(value) {

        this.playAudio();

        switch (value) {
            case "ac":
                this.clearAll()
                break;
            case "ce":
                this.clearEntry();
                break;
            case "soma":
                this.addOperation("+");
                break;
            case "subtracao":
                this.addOperation("-");
                break;
            case "multiplicacao":
                this.addOperation("*");
                break;
            case "divisao":
                this.addOperation("/");
                break;
            case "porcento":
                this.addOperation("%");
                break;
            case "igual":
                this.calc();
                break;
            case "ponto":
                this.addDot(".");
                break;
            case "0":
            case "1":
            case "2":
            case "3":
            case "4":
            case "5":
            case "6":
            case "7":
            case "8":
            case "9":
                this.addOperation(parseInt(value));

                break;
            default:
                this.setErros();

                break;
        }

    }

    /**
     * inicia os botões
     */
    initButtonsEvents() {
        let buttons = document.querySelectorAll("#buttons > g, #parts > g");

        buttons.forEach((btn, index) => {

            this.addEventListenerAll(btn, 'click drag', e => {
                let textBtn = btn.className.baseVal.replace("btn-", "");
                this.execBtn(textBtn);
            });

            this.addEventListenerAll(btn, 'mouseover mouseup mousedown', e => {
                btn.style.cursor = "pointer"
            });

        });
    }

    /**
     * adiciona a data e hora na calculadora
     */
    setDisplayDateTime() {
        this._displayTime = new Date().toLocaleTimeString(this._locale);
        this._displayDate = new Date().toLocaleDateString(this._locale,
            {
                day: "2-digit",
                month: "long",
                year: "numeric"
            }
        );
    }

    // GET E SET
    get _displayTime() {
        return this._timeEl.innerHTML;
    }

    set _displayTime(valor) {
        this._timeEl.innerHTML = valor;
    }

    get _displayDate() {
        return this._dateEl.innerHTML;
    }

    set _displayDate(valor) {
        this._dateEl.innerHTML = valor;
    }

    get displayCalc() {
        return this._displayCalcEl.innerHTML;
    }

    set displayCalc(valor) {

        if (valor.toString().length > 10) {
            this.setErros();
            return false;
        }

        this._displayCalcEl.innerHTML = valor;
    }

    get currentDate() {
        return new Date();
    }

    set currentDate(valor) {
        this._dateEl.innerHTML = valor;
    }

}