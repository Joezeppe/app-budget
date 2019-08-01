var budgetController = (function(){
    
    var Expense = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    }

    Expense.prototype.calcPercentage = function(totalIncome){
        if(totalIncome > 0){
            this.percentage = Math.round((this.value/totalIncome)*100);
        } else {
            this.percentage = -1;
        }  
    }

    

    Expense.prototype.getPercentage = function(){
        return this.percentage;
    };

    var Income = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
    }

    var data = {
        allItems : {
            exp: [],      
            inc: []
        },
        totals: {
            exp:0,
            inc:0
        },
        budget : 0,
        
        percentage: -1
     };




    return {
        addItem : function(type, des, val){ 
            
            var newItem,ID;
            
            //Create new ID
            if(data.allItems[type].length > 0){
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }
            //Create new Item based on inc or exp type
            if(type === 'exp'){
                newItem = new Expense(ID,des,val);

                
            } else if(type === 'inc'){
                newItem = new Income(ID,des,val);
            }

            //Push the new item into the data structure
            data.allItems[type].push(newItem);

            return newItem;
        },

        calculateTotal: function(type){
            var sum = 0;

            data.allItems[type].forEach(function(cur){
                sum += cur.value;
            });

            data.totals[type] = sum;
        },

        deleteItem: function(type, id){
            // id =3
            var index;

            var ids = data.allItems[type].map(function(current){
                return current.id;
            });

            index = ids.indexOf(id);

            if(index !== -1){
                data.allItems[type].splice(index,1);
            }
             
        },

        calculateBudget: function(){

            //calculate total income and expenses
            this.calculateTotal('exp');
            this.calculateTotal('inc');

            //calculate the budget income - expenses
            data.budget = data.totals.inc - data.totals.exp;
            
            //calculate the percentage of income we spent
            if(data.totals.inc > 0){
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else{
                data.percentage = -1;
            }

        },

        calculatePercentages: function(){
            data.allItems.exp.forEach(function(cur){
                cur.calcPercentage(data.totals.inc);
            });
        },

        

        getPercentages: function(){
            var allPerc = data.allItems.exp.map(function(cur){
                return cur.getPercentage();
            })
            return allPerc;
        },

        getBudget: function(){

            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            }
        },
         


        testing: function(){
            
            console.log(data);
        }
    }


    

})();
  

/* --------------------------------------------------------- */

var  UIController = (function(){

    var DOMstrings = {
        inputType: '.add__type',
        inputDescription : '.add__description',
        inputValue: '.add__value',
        inputBtn : '.add__btn',
        incomeContainer: '.income__list',
        expenseContainer: '.expenses__list',
        budgetIncVal : '.budget__income--value',
        budgetExpVal : '.budget__expenses--value',
        budgetTotVal:  '.budget__value',
        budgetPercentageLabel : '.budget__expenses--percentage',
        container: '.container',
        itemPercentage: '.item__percentage',
        dateLabel: '.budget__title--month'
    };

        var formatNumber  = function(num,type){
        //num number
        //type exp or inc
        // + or - before number exactly 2 decimal points coma separtating the thousands
        var numSplit,int,dec,type;
        num = Math.abs(num);
        num = num.toFixed(2);

        numSplit = num.split('.');

        int = numSplit[0];

        if(int.length > 3){
            int = int.substr(0,int.length - 3)  + ',' + int.substr(int.length -3, int.length);
        }

        dec = numSplit[1];

        return (type === 'exp' ?  '-'  : '+') + ' ' + int + '.' + dec ;
    };

    var nodeListForEach = function(list, callback){
        for(var i=0;i<list.length;i++){
            callback(list[i], i ); 
        }
    };


    return {
        getInput: function(){
           return {
                type:  document.querySelector(DOMstrings.inputType).value, //will be either inc or exp
                description:  document.querySelector(DOMstrings.inputDescription).value,
                value : parseFloat(document.querySelector(DOMstrings.inputValue).value),
           };
        },

        getDOMStrings: function(){
            return DOMstrings;
        },

        addListItem: function(obj, type){
            var html, newHtml,element;

            if (type === 'inc'){

                element = document.querySelector(DOMstrings.incomeContainer);
                html = `<div class="item clearfix" id="inc-%id%"><div class="item__description">
                %description%</div><div class="right clearfix"><div class="item__value">%value%</div>
                <div class="class item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline">
                </i></button></div> </div></div>`

            } else if ( type === 'exp' ) {

                element = document.querySelector(DOMstrings.expenseContainer);
                html = `<div class="item clearfix" id="exp-%id%">
                            <div class="item__description">%description%</div>
                            <div class="right clearfix">
                                <div class="item__value">%value%</div>
                                <div class="item__percentage">%percentage%</div>
                                <div class="item__delete">
                                    <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
                                </div>
                            </div>
                        </div>`;
            }
            
           
           
            
            //replace the placeholder text with some actual data
            newHtml = html.replace('%id%',obj.id);
            newHtml = newHtml.replace('%description%',obj.description);
            newHtml = newHtml.replace('%value%',formatNumber(obj.value, type));
            newHtml = newHtml.replace('%percentage%',obj.percentage);
            //insert into the dom html
            element.insertAdjacentHTML('beforeend', newHtml);

           // document.querySelector(DOMstrings.budgetIncVal).innerHTML = dataAll.data.totals.inc;
           // document.querySelector(DOMstrings.budgetExpVal).innerHTML = dataAll.data.totals.exp;
        },

        deleteListItem: function(selectorID){
            var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
        },


        clearFields: function(){  

            var fields, fieldsArr;

            fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);
            

            fieldsArr = Array.prototype.slice.call(fields);

            fieldsArr.forEach(function(current, index, array){

                current.value = "";

            });


            fieldsArr[0].focus();
        },

        displayBudget: function(obj){
            var type;

            if(obj.budget > 0){
                type  = 'inc';
            } else {
                type = 'exp';
            }
            document.querySelector(DOMstrings.budgetTotVal).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMstrings.budgetIncVal).textContent = formatNumber(obj.totalInc,'inc');
            document.querySelector(DOMstrings.budgetExpVal).textContent = formatNumber(obj.totalExp,'exp');
            
            if(obj.percentage > 0){
                document.querySelector(DOMstrings.budgetPercentageLabel).textContent = obj.percentage + '%';
            }else{
                document.querySelector(DOMstrings.budgetPercentageLabel).textContent = '----';
            }
        },

        displayPercentages: function(percentages){
            var fields = document.querySelectorAll(DOMstrings.itemPercentage);
            console.log(typeof(percentages));
            

            nodeListForEach(fields, function(cur,ind){
                if(percentages[ind]>0){
                    cur.textContent = percentages[ind] + '%';
                } else {
                    cur.textContent = '--';
                }
            });
        },

        displayMonth: function(){
            var now, year;
            now = new Date();

            year = now.getFullYear();
            var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 
            'August', 'September', 'October', 'November', 'December'];
            month =  now.getMonth();

            document.querySelector(DOMstrings.dateLabel).textContent = months[month]+ '  '+year;

            

        },

        changeType: function(){

            var fields = document.querySelectorAll(DOMstrings.inputType + ',' +
            DOMstrings.inputDescription + ',' +
            DOMstrings.inputValue );


            nodeListForEach(fields, function(cur){
                cur.classList.toggle('red-focus');
            });

            document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
        }

        
    }
})();


/* --------------------------------------------------------- */



var controller = (function(budgetCtrl, UICtrl){

    var setupEventListeners = function(){

        var DOM = UICtrl.getDOMStrings();

        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

        document.addEventListener('keypress', function(e){
 
            if(e.keyCode === 13 || e.which === 13){

                ctrlAddItem();
            } 
        });

        document.querySelector(DOM.container).addEventListener('click', ctrDeleteItem);

        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changeType);

    };

    var updateBudget = function(){
        //1. Calculate the budget 
            budgetCtrl.calculateBudget();
        //2. Return the budget
        var budget = budgetCtrl.getBudget();

        //3. Display the budget on the UI
        UICtrl.displayBudget(budget);
    }

    var updatePercentages = function(){
        //calculate percentage
            budgetCtrl.calculatePercentages();
        //read them from bdgctrl
            var percentages = budgetCtrl.getPercentages();
        //display in ui
        console.log(percentages);
        UICtrl.displayPercentages(percentages);
    }



    

    var ctrlAddItem = function(){
        
        var input, newItem;

                //1-GET THE FIELD INPUT DATA
                var input = UICtrl.getInput();
                console.log(input);
                if(input.description !==  "" && !isNaN(input.value) && input.value > 0){

                //2-add the item to the budget controller
                newItem = budgetCtrl.addItem(input.type, input.description,input.value);

                //3-Add the item to the UI
                UICtrl.addListItem(newItem,input.type);

                //4- Clear the fields;
                UICtrl.clearFields();

                //5- calculate and update budget
                updateBudget(); 


                //calculate and update percentages
                updatePercentages();
        }
        
       
    };

    var ctrDeleteItem = function(event){
        var itemID;
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id; 

        if(itemID){
            //inc-1
            splitID = itemID.split('-'); 
            type = splitID[0];
            ID = parseInt(splitID[1]);



            //1.delete item from data structure
            budgetCtrl.deleteItem(type,ID);
            //2.delete from ui
            UICtrl.deleteListItem(itemID);
            //3.update and show the new budget
            updateBudget();
            
        }

    }

    return {
        init: function(){
            console.log('Start of Application');
            UICtrl.displayMonth();
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            })
            setupEventListeners();
        }
    }
    


})(budgetController, UIController)

controller.init();