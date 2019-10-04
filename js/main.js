
let followers = 0;
let money = 0;
let followers_per_click = 1;
let money_per_follower = 0.01;


class Upgrade {
  constructor(id, name, description, price, effect) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.price = price;
    this.effect = effect;
    this.owned = false;
  }
  buy() {
    if(money >= this.price && !this.owned) {
      money -= this.price;
      this.owned = true;
      this.effect();
      $("#upgrade-"+this.id+"-btn").remove();
      $("#upgrade-"+this.id+"-price").remove();
      $("#upgrade-"+this.id).removeClass("red");
      $("#upgrade-"+this.id).addClass("green accent-4")
    }
  }
}


class Building {
  constructor(name, description, price, effect, price_inc) {
    this.name = name;
    this.description = description;
    this.price = price;
    this.price_inc = price_inc || 1.1;
    this.effect = effect;
    this.count = 0;
  }

  execute() {
    this.effect();
  }

  buy() {
    if (money >= this.price) {
      money -= this.price;
      this.price = this.price * this.price_inc;
      this.count++;
    } else {
      M.toast({html: "You need more money for this action."})
    }
  }
}


let buildings = [
  new Building("Meeting place", "Recrutes 1 follower per second", 2, function() {
    followers += this.count * 0.1;
  }, 1.1)
];


let upgrades = [
  new Upgrade("double-fee-0", "Higher fee", "Increases your followers' fee by 100%", 50, function () {
    money_per_follower += money_per_follower;
  }),
  new Upgrade("unlock-church", "Unlock church", "Unlocks the church building", 100, function () {
    buildings.push(new Building("Church", "Recrutes 10 followers per second", 100, function() {
      followers += this.count * 1;
    }, 1.4));
    document.getElementById("buildings-card").innerHTML += "" +
      "<div style='padding-bottom: 10px' class='card col s12'><h6>Church</h6><span>Recrutes 10 followers per second<br>Price: $ <span id='building-" + (buildings.length-1).toString() + "-price'>100</span></span><br>" +
      "<button onclick='buildings[" + (buildings.length-1).toString() + "].buy()' class='btn-flat orange waves-effect'>Buy</button></div>";
  })
];


function update_display() {
  $("#follower-stat").text(followers.toFixed(0));
  $("#money-stat").text(money.toFixed(2));
  for(let building in buildings) {
    $("#building-" + building + "-price").text(buildings[building].price.toFixed(2));
  }
}

function tick() {
  money += followers * (money_per_follower * 0.1);
  for (let building in buildings) {
    buildings[building].execute();
  }
}

document.getElementById("recruit-btn").addEventListener("click", function () {
  followers += followers_per_click;
});


document.getElementById("buildings-card").innerHTML = '';
for(let building in buildings) {
  document.getElementById("buildings-card").innerHTML += "" +
    "<div style='padding-bottom: 10px' class='card col s12'><h6>" + buildings[building].name + "</h6><span>" +
    buildings[building].description + "<br/>Price: $ <span id='building-" + building + "-price'>" + buildings[building].price.toFixed(2) + "</span></span><br>" +
    "<button onclick='buildings[" + building + "].buy()' class='btn-flat orange waves-effect'>Buy</button></div>";
}
document.getElementById("upgrades-card").innerHTML = '';
for(let upgrade in upgrades) {
  document.getElementById("upgrades-card").innerHTML += "" +
    "<div style='padding-bottom: 10px' class='card col s12 red' id='upgrade-"+upgrades[upgrade].id+"'><h6>" + upgrades[upgrade].name + "</h6><span>" +
    upgrades[upgrade].description + "<span id='upgrade-" + upgrades[upgrade].id + "-price'><br>Price: $ " + upgrades[upgrade].price + "</span></span><br>" +
    "<button id='upgrade-" + upgrades[upgrade].id + "-btn' onclick='upgrades[" + upgrade + "].buy()' class='btn-flat orange waves-effect'>Buy</button></div>";
}

const intervalID = window.setInterval(() => {
  tick();
  update_display();
}, 100);

