// JavaScript Document
ko.bindingHandlers.numeric = {
  init: function(element, valueAccessor) {
    $(element).on("keydown", function(event) {
      if (event.keyCode == 46 || event.keyCode == 8 || event.keyCode == 9 || event.keyCode == 27 || event.keyCode == 13 ||
        // Allow: Ctrl+A
        (event.keyCode == 65 && event.ctrlKey === true) ||
        // Allow: . ,
        (event.keyCode == 188 || event.keyCode == 190 || event.keyCode == 110) ||
        // Allow: home, end, left, right
        (event.keyCode >= 35 && event.keyCode <= 39)) {
        // let it happen, don't do anything
        return;
      } else {
        // Ensure that it is a number and stop the keypress
        if (event.shiftKey || (event.keyCode < 48 || event.keyCode > 57) && (event.keyCode < 96 || event.keyCode > 105)) {
          event.preventDefault();
        }
      }
    });
  }
};
const Genders = [
  "Male",
  "Female"
];
function User(id, name, gender, age) {
  this.id = id;
  this.name = ko.observable(name);
  this.gender = ko.observable(gender);
  this.age = ko.observable(age);

  this.isInEdit = ko.observable(false);
}

var ViewModel = function() {
  const self = this;
  /* ADD SOME TEST USERS */
  this.users = ko.observableArray([
    new User("1", "John Doe", Genders[0], 32),
    new User("2", "Diana Barry", Genders[1], 28),
    new User("3", "Bruce Wayne", Genders[0], 46),
    new User("4", "Jane Porter", Genders[1], 19),
    new User("5", "Lucy Steele", Genders[1], 31),
    new User("6", "Oliver Twist", Genders[0], 56),
    new User("7", "Donald Duck", Genders[0], 76)
  ]);
  /* ADD USER RELATED FUNCTIONS AND VARIABLES */
  this.nextUserId = self.users().length + 1;
  this.newUserName = ko.observable();
  this.newUserGender = ko.observable();
  this.newUserAge = ko.observable();

  this.isUserValid = ko.computed(function() {
    return self.newUserName() && self.newUserGender() && self.newUserAge();
  });

  this.addUser = function() {
    self.users.push(new User(self.nextUserId.toString(), self.newUserName(), self.newUserGender(), parseInt(self.newUserAge())));
    self.newUserName("");
    self.newUserGender("");
    self.newUserAge("");
    self.nextUserId++;
    self.setAllUserToNoneditMode();
    if (self.sortColumn()) {
      self.users.sort(function(a, b) {
        if (a[self.sortColumn()]() < b[self.sortColumn()]()) {
          return !self.isSortAsc();
        } else {
          return self.isSortAsc();
        }
      });
    }
  };

  /* SORTING RELATED FUNCTIONS AND VARIABLES */
  this.sortColumn = ko.observable("");
  this.isSortAsc = ko.observable(true);
  this.sortUsersTable = function(target) {
    self.setAllUserToNoneditMode();
    if (self.sortColumn() === target) {
      self.isSortAsc(!self.isSortAsc());
	} else {
      self.sortColumn(target);
      self.isSortAsc(true);
    }

    self.users.sort(function(a, b) {
      if (a[self.sortColumn()]() < b[self.sortColumn()]()) {
		 return !self.isSortAsc();
	  } else {
	    return self.isSortAsc();
	  }
    });
  }
  
  /* EDIT USER RELATED FUNCTIONS AND VARIABLES */
  this.activeUser = ko.observable(new User("", "", Genders[0], 0));
  this.userInEdit = ko.observable(new User("", "", Genders[0], 0));
  
  this.setAllUserToNoneditMode = function() {
    ko.utils.arrayForEach(self.users(), function(user) {
      user.isInEdit(false);
    })
  }

  this.setUserToEditMode = function(user) {
    self.setAllUserToNoneditMode();
    self.userInEdit(new User("0", user.name(), user.gender(), user.age()));
    self.activeUser(user);
    user.isInEdit(true);
  }

  this.isUserInEditValid = ko.computed(function() {
    return self.userInEdit().name() && self.userInEdit().gender() && self.userInEdit().age();
  });

  this.saveUserChanges = function() {
    self.activeUser().name(self.userInEdit().name());
    self.activeUser().gender(self.userInEdit().gender());
    self.activeUser().age(parseInt(self.userInEdit().age()));
    self.activeUser().isInEdit(false);
  }
  /* DELETE USER RELATED FUNCTIONS AND VARIABLES */
  this.setActiveUser = function(user) {
    self.setAllUserToNoneditMode();
    self.activeUser(user);
  }

  this.deleteUser = function() {
    self.users.remove(self.activeUser());
  }
  /* PAGINATION RELATED FUNCTIONS AND VARIABLES */
  this.pageNumber = ko.observable(0);
  this.nbPerPage = 5;
  this.totalPagesHolder = ko.observableArray([]);
  this.totalPages = ko.computed(function() {
    var div = Math.floor(self.users().length / self.nbPerPage);
    div += self.users().length % self.nbPerPage > 0 ? 1 : 0;

    self.totalPagesHolder.removeAll();
    for (var i = 0; i < div; i++) {
      self.totalPagesHolder.push(i + 1);
    }
    return;
  });

  this.pageController = function(targetPage) {
    return self.pageNumber(targetPage - 1);
  };
  
  this.paginatedUsers = ko.computed(function() {
    var first = self.pageNumber() * self.nbPerPage;
    return self.users.slice(first, first + self.nbPerPage);
  });
};

ko.applyBindings(new ViewModel());