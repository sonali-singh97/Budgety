
var budgetController = (function(){
var Income=function(id, description, value){
this.id =id,
this.description=description,
this.value = value
this.percentage=-1;
};

 var Expense=function(id, description, value){
    this.id =id,
    this.description=description,
    this.value = value
    };

    Expense.prototype.calcPercentages =function(totalIncome){
        if(totalIncome>0) {
      this.percentage=Math.round((this.value/totalIncome)*100);
        }

        else
        this.percentage=-1;
    };

    
    Expense.prototype.getPercentages =function(){
      return this.percentage;
    };

    var data={
     allItems :{
       exp : [],
       inc : []
     },
     totals :{
         exp: 0,
         inc : 0
     } ,
     budget : 0,
     percentage : -1
    };
  
  var calculateTotal=function(type){
      var sum=0;

      data.allItems[type].forEach(function(element) {
          sum+=element.value;
      });

      data.totals[type]=sum;
  };

    return {
        addItem : function(type, description,value){
       var newItem,id;
      if(data.allItems[type].length!==0)
      {
          id=data.allItems[type][data.allItems[type].length-1].id+1;
      }
      else{
          id=0;
      }


       if(type==="exp"){
           newItem= new Expense(id,description,value);
       }
       else
       {
        newItem= new Income(id,description,value);
       }

       data.allItems[type].push(newItem);
       return newItem;
        },
      
      calculateBudget : function(){
       // calculate total income and expenses
       calculateTotal('exp');
       calculateTotal('inc');
      
       data.budget = data.totals.inc - data.totals.exp ;

       //calculate percentage
       if(data.totals.inc>0){
           data.percentage= Math.round((data.totals.exp/ data.totals.inc)*100);
       }
       else{
           data.percentage=-1;
       }

       
      },

      

     getBudget : function(){
         return{
             totalInc : data.totals.inc,
             totalExp : data.totals.exp,
             budget : data.budget,
             percentage : data.percentage
         };
     },

     deleteItem : function(type,id){

        var Ids,index;

       Ids = data.allItems[type].map(function(current){
        
        return current.id;
       });

        index= Ids.indexOf(id);
       
        if(index!==-1){
            data.allItems[type].splice( index,1);
        }
     } ,

     calculatePercent : function(){
         data.allItems.exp.forEach(function(current){
             current.calcPercentages(data.totals.inc);
         });
     },

     getPercentage : function(){
         var percentages=data.allItems.exp.map(function(curr){
             return curr.getPercentages();
         });
         
         return percentages;
     }
       
    };
})();



var uiController= (function(){
var DOMstrings={
    button : ".add__btn",
    inputDesc : ".add__description",
    inputValues : ".add__value",
    inputType   : ".add__type",
    incomeContainer : ".income__list",
    expenseContainer : ".expenses__list",
    budget : ".budget__value",
    totalIncome :".budget__income--value",
    totalExpense : ".budget__expenses--value",
    expensePercent : ".budget__expenses--percentage",
    container : ".container",
    itemPercent : ".item__percentage",
    dateLabel : ".budget__title--month"
    
};

var nodeListForEach = function(list, callback) {
    for (var i = 0; i < list.length; i++) {
        callback(list[i], i);
    }
};

var formatValues = function(value,type){
    var num,int,dec;

     value=Math.abs(value);
     value=value.toFixed(2);

     num=value.split(".");
     int=num[0];
     dec=num[1];

     if(int.length>3){
         int =int.substr(0,int.length-3)+","+ int.substr(int.length-3,3);
     }
  
     return   (type==="exp"? "-" : "+") + " " + int+"." + dec;
};

return{
    getDOM : function(){
        return DOMstrings;
     },

    getInput : function(){

        return{
         description : document.querySelector(DOMstrings.inputDesc).value,
         value :parseFloat(document.querySelector(DOMstrings.inputValues) .value),
         type : document.querySelector(DOMstrings.inputType).value
        };
    },

    addInputs : function(obj,type){

         var html , newHtml, element;
         if(type==="inc") {
            element=DOMstrings.incomeContainer;

       html='<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'; }

        else {
        element=DOMstrings.expenseContainer;
       html ='<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
         }

      newHtml =html.replace("%id%",obj.id);
      newHtml= newHtml.replace("%description%" ,obj.description);
      newHtml= newHtml.replace("%value%",formatValues(obj.value,type));

      document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);

      },

      clearData : function(){
     
      var fields, fieldsArr;
            
      fields = document.querySelectorAll(DOMstrings.inputDesc + ', ' + DOMstrings.inputValues);
      
      fieldsArr = Array.prototype.slice.call(fields);
      
      fieldsArr.forEach(function(current, index, array) {
          current.value = "";
      });
      
      fieldsArr[0].focus();
      },

     displayBudget : function(object){
        var type;
        object.budget > 0 ? type = 'inc' : type = 'exp';

     document.querySelector(DOMstrings.budget).textContent=formatValues(object.budget,type);
     document.querySelector(DOMstrings.totalIncome).textContent=formatValues(object.totalInc,"inc");
     document.querySelector(DOMstrings.totalExpense).textContent=formatValues(object.totalExp,"exp");
    
     if(object.percentage>0) {
     document.querySelector(DOMstrings.expensePercent).textContent=object.percentage + "%";
     }

     else {
        document.querySelector(DOMstrings.expensePercent).textContent="---";
     }
     },

    displayPercentages: function(percentages){
     var field = document .querySelectorAll(DOMstrings.itemPercent);

      nodeListForEach(field, function(curr,index){

       if(percentages[index]> 0){
      curr.textContent=percentages[index]+ "%";
       }
       else {
        curr.textContent="---" ;
       }
     });
     },

    deleteListItem : function (targetId){
        var el =document.getElementById(targetId);
      el.parentNode.removeChild(el);
    },

    changedType : function(){

        var fields = document .querySelectorAll(
          DOMstrings.inputType + ','
        + DOMstrings.inputDesc +','
        +DOMstrings.inputValues );

        nodeListForEach(fields,function(curr){
            curr.classList.toggle('red-focus');
        });
        
      console.log("change");
        document.querySelector(DOMstrings.button).classList.toggle("red");
    },

    displayMonth : function(){
        var today,day,options;
        today=new Date();
        
        options={
            month : "long",
            year : "numeric"
        };

        day=today.toLocaleDateString("en-US",options);
        document.querySelector(DOMstrings.dateLabel).textContent=day;

    }

    

};


})();



var Controller =(function(uiCntrl ,budgetCntrl){
    
    
    var addEventListeners= function(){
        var DOM =uiCntrl.getDOM();
        document.querySelector(DOM.button).addEventListener("click",addElements);

        document.addEventListener("keypress",function(event){
           if(event.keycode ===13|| event.which===13)
           {
               addElements();
           }
        });

        document.querySelector(DOM.container).addEventListener("click" , deleteElement);

        document.querySelector(DOM.inputType).addEventListener("change",uiCntrl.changedType);
     };

     var updatePercent=function(){
        var allPercent;
     //calculate percentages
     budgetCntrl.calculatePercent();
     //Get percentages
     allPercent=budgetCntrl.getPercentage();
      //add percentage to UI
      uiCntrl.displayPercentages(allPercent);
     };


 var updateBudget=function(){
 //calculate budget
  budgetCntrl.calculateBudget();
 //Get budget
   var newBudget = budgetCntrl.getBudget();
 //add budget to UI.
    uiCntrl.displayBudget(newBudget);

 };
 

 var addElements =function(){
   
    //1.get input values
     var input=uiCntrl.getInput();

     if(input.description!==""&& !isNaN(input.value) && input.value!==0) {
    //2.add items to budget controller
     var newItem=  budgetCntrl.addItem(input.type,input.description,input.value);

    //3.Add items to UI.
      uiCntrl.addInputs(newItem,input.type);
    //4.Clear the fields
       uiCntrl.clearData();
    //5.calculate and update budget
       updateBudget();
    //calculate and update percentage
        updatePercent();
     }
      };

     var deleteElement =function(event){

        var targetId, splitId, type,id, element;
         targetId = event.target.parentNode.parentNode.parentNode.parentNode.id;

         if(targetId){
        splitId = targetId.split('-');
        type = splitId[0];
        id =parseInt(splitId[1]);
        
        //1.delete element from data structure
         budgetCntrl.deleteItem(type,id);

        //2.delete element from UI
          uiCntrl.deleteListItem(targetId);
        //3.update budget
         updateBudget();
        //4.update percentage
         updatePercent();

       }
       };

       

      return {
          init : function(){
              console.log("Application has started");
            addEventListeners();
            uiCntrl.displayMonth();
            uiCntrl .displayBudget({
                totalInc : 0,
                totalExp : 0,
                budget : 0,
                percentage : 0
            });
          }
      };

})(uiController,budgetController);

Controller.init();
