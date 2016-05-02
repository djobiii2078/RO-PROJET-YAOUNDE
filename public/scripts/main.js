'use strict';

var app = angular.module('MyApp', ['ngMaterial', 'ngMdIcons','ngAnimate','ngRoute','ngCookies','ngStorage','flow','webcam']);

//Définition des routes
/*app.config(config);

config.$inject = ['$routeProvider','$locationProvider'];

function config($routeProvider,$locationProvider)
{
  $routeProvider
    .when('/login',{
        controller : 'loginController',
        templateUrl : 'login/index.html',
        controllerAs : 'auth'
    })
    .when('/register',{
        controller : 'RegistrationService',
        templateUrl : 'register/index.html',
        controllerAs : 'reg'
    })
    .when('/work',{
        controller : 'workController',
        templateUrl : 'work/index.html',
        controllerAs : 'work'

    })
    .when('/work/stats',{
        controller : 'statController',
        templateUrl : 'work/stat/index.html',
        controllerAs : 'stats'
    })
    .otherwise({redirectTo : '/login'});
}

*/
/*
var mysql = require('mysql');

var connection  = mysql.createConnection({

    host : 'localhost',
    user : 'root',
    password : 'root',
    database : 'urgencia'

});

 connection.connect(function(err){
                if(err) console.log("Database loading error ...");
                else console.log("Database loading successfull ...");
            });
*/
//Service Authentification

app.factory('UserService',UserService);

UserService.$inject = ['$timeout', '$filter', '$q'];

function UserService($timemeout, $filter, $q)
{
        var service = {};



        service.GetAll = GetAll;
        service.GetByUsername= GetByUsername;
        service.GetById = GetById;
        service.Create = Create;
        service.Update = Update;


        return service;

        function GetAll()

        {


            var deferred = $q.defer();
            var query = "SELECT * FROM savior ";
            connection.query(query,function(err,rows){
                if(err) deferred.reject(err);
                deferred.resolve(rows);
                console.log(rows);
            });

            return deferred.promise;
        }

        function GetByUsername(username)
        {

            var deferred = $q.defer();
            var query = "SELECT * FROM savior WHERE username = ?";
            var voir = connection.query(query,[username],function(err,rows){
                if(err) deferred.reject(err);
                deferred.resolve(rows);

            });

            return deferred.promise;
        }


        function GetById(id)
        {
            var deferred = $q.defer();
            var query = "SELECT * FROM savior WHERE idsavior = ?";
            connection.query(query,[id],function(err,rows){
                if(err) deferred.reject(err);
                deferred.resolve(rows);
            });

            return deferred.promise;
        }

        function Create(user)
        {
            var deferred = $q.defer();
            var query = "INSERT INTO savior(username,password,email,phone) VALUES (?,?,?,?)";
            var voir =  connection.query(query,[user.username,user.password,user.email,user.phone],function(err,res){
                if(err) deferred.reject(res);
                deferred.resolve({success:true});
            });
            console.log(voir.sql);
            return deferred.promise;
        }

        function Update(user)
        {
            var deferred = $q.defer();
            var query = "UPDATE SAVIOR SET email = ? AND phone = ? WHERE idsavior = ?";
            connection.query(query,[user.email],[user.phone],[user.id],function(err,rows){
                if(err) deferred.reject(err);
                deferred.resolve(res);
            });
            deferred.promise;
        }


}
app.controller('RegistrationService',RegistrationService);
RegistrationService.$inject =['UserService','AuthentificationService','$location','$rootScope','$mdDialog'];

function RegistrationService(UserService,AuthentificationService, $location, $rootScope,$mdDialog)
{


    var reg = this;

    reg.register = register;
    reg.change = change;

    console.log(reg.username+':'+reg.password+':'+reg.email+':'+reg.phone+':'+UserService.Create(reg));



    function change()
    {
        $('#inscription').fadeIn(300);
        $('#login').hide();
    }

    function register()
    {
        reg.dataLoading = true;
        UserService.Create(reg)
            .then(function(response){
                if(response.success){
                    AuthentificationService.SetCredentials(reg.username,reg.password);


                            $mdDialog.show(
                                $mdDialog
                                  .alert()
                                  .clickOutsideToClose(true)
                                  .title('Account successfully created')
                                  .content('Your account has been created successfully. You will now be redirected to your dashboard.')
                                  .ok('OK')
                                  .targetEvent(null)

                            );
                    $location.path('/work');
                }else{

                    $mdDialog.show(
                        $mdDialog
                            .alert()
                            .clickOutsideToClose(true)
                            .title('Account successfully created')
                            .content('Problem during the creation of your account. Please use different credentials.')
                            .ok('RETRY')
                            .targetEvent(null)


                    );
                    reg.dataLoading = false;
                }
            });
    }

}


app.factory('AuthentificationService',AuthentificationService);
AuthentificationService.$inject = ['$http','$cookieStore', '$rootScope', '$timeout', 'UserService'];

function AuthentificationService($http, $cookieStore, $rootScope, $timeout, UserService) {

  var service = {};

  service.Login = Login;
  service.SetCredentials = SetCredentials;
  service.ClearCredentials = ClearCredentials;

  return service;

  function Login(username, password, callback){

    $timeout(function(){

        var response;
        UserService.GetByUsername(username)
              .then(function(user){
                  if(user !=null && user[0] !=null &&  user[0].password == password){
                    response = {success:true};
                  }else{

                    response = {success : false, message: 'Your username or password was incorrect. Please try again.'};
                  }
                  callback(response);

              });


    },100);
  }

  function SetCredentials(username,password)
  {

    $rootScope.globals = {
        currentUser:{
          username : username,
        }
    };


    $cookieStore.put('globals',$rootScope.globals);
    console.log($cookieStore.get('globals'));
  }

  function ClearCredentials()
  {
    $rootScope.globals ={};
    $cookieStore.remove('globals');

  }

}
var Base64 = {

       keyStr: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=',

       encode: function (input) {
           var output = "";
           var chr1, chr2, chr3 = "";
           var enc1, enc2, enc3, enc4 = "";
           var i = 0;

           do {
               chr1 = input.charCodeAt(i++);
               chr2 = input.charCodeAt(i++);
               chr3 = input.charCodeAt(i++);

               enc1 = chr1 >> 2;
               enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
               enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
               enc4 = chr3 & 63;

               if (isNaN(chr2)) {
                   enc3 = enc4 = 64;
               } else if (isNaN(chr3)) {
                   enc4 = 64;
               }

               output = output +
                   this.keyStr.charAt(enc1) +
                   this.keyStr.charAt(enc2) +
                   this.keyStr.charAt(enc3) +
                   this.keyStr.charAt(enc4);
               chr1 = chr2 = chr3 = "";
               enc1 = enc2 = enc3 = enc4 = "";
           } while (i < input.length);

           return output;
       },

       decode: function (input) {
           var output = "";
           var chr1, chr2, chr3 = "";
           var enc1, enc2, enc3, enc4 = "";
           var i = 0;

           // remove all characters that are not A-Z, a-z, 0-9, +, /, or =
           var base64test = /[^A-Za-z0-9\+\/\=]/g;
           if (base64test.exec(input)) {
               window.alert("There were invalid base64 characters in the input text.\n" +
                   "Valid base64 characters are A-Z, a-z, 0-9, '+', '/',and '='\n" +
                   "Expect errors in decoding.");
           }
           input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

           do {
               enc1 = this.keyStr.indexOf(input.charAt(i++));
               enc2 = this.keyStr.indexOf(input.charAt(i++));
               enc3 = this.keyStr.indexOf(input.charAt(i++));
               enc4 = this.keyStr.indexOf(input.charAt(i++));

               chr1 = (enc1 << 2) | (enc2 >> 4);
               chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
               chr3 = ((enc3 & 3) << 6) | enc4;

               output = output + String.fromCharCode(chr1);

               if (enc3 != 64) {
                   output = output + String.fromCharCode(chr2);
               }
               if (enc4 != 64) {
                   output = output + String.fromCharCode(chr3);
               }

               chr1 = chr2 = chr3 = "";
               enc1 = enc2 = enc3 = enc4 = "";

           } while (i < input.length);

           return output;
       }
   };



app.controller('loginController',loginController);
loginController.$inject=['$location','$window','$scope','$localStorage','$sessionStorage','AuthentificationService','$mdDialog'];

function loginController($location,$window,$scope,$localStorage,$sessionStorage,AuthentificationService,$mdDialog)
{


  var auth = this;
  auth.login = login;
  auth.change  = change;
  auth.goBack = goBack;

  (function initController(){
  //@TODO : Vérifier si la personne s'est deconnecté
  })();


          function change()
          {
              $('#inscription').fadeIn(300);
              $('#login').hide();
          }

          function goBack()
          {
            $('#login').fadeIn(300);
            $('#inscription').hide();
          }



  function login()
  {
    auth.dataLoading = true;

    AuthentificationService.Login(auth.username,auth.password,function(response){

      if(response.success)
      {

        //AuthentificationService.SetCredentials(auth.username,auth.password);
        $scope.$storage = $localStorage.$default({
          username: null
        });
        $scope.$storage = $localStorage;
        $localStorage.username = auth.username;
        angular.toJson($localStorage);
        console.log('OK');
        //$location.absUrl('../work/index.html');
        $window.location.href='./work/index.html';
      }else{

        auth.dataLoading=false;

        $mdDialog.show(
              $mdDialog.alert()
              .clickOutsideToClose(true)
              .title('ERROR')
              .content(response.message)
              .ok('RETRY')
              .targetEvent(null)

        );

//        FlashService.Error(response.message);

      }

    });
  }

}



//@TODO : Penser à implementer les graphes du % de personnes qui payent à temps contre le % des personnes qui ne payent pas à temps par mois pour une année donnée

//@TODO : Penser à implementer le tableau des personnes qui n'ont pas encore payé et qui ont dépassé la date limite

app.factory('PatientService',PatientService);
PatientService.$inject=['$q'];

function PatientService($q)
{
  var service = {};


  service.GetAll = GetAll;
  service.GetById = GetById;
  service.GetByCNI = GetByCNI;
  service.GetByName = GetByName;
  service.Create = Create;
  service.Update = Update;
  service.TrueDelete = TrueDelete;
  service.SoftDelete = SoftDelete;

  return service;

    function GetAll()
  {
    var deferred = $q.defer();
    var query = "SELECT * FROM urgence where isDelete = 0";
    connection.query(query,function(err,rows){

        if(err) deferred.reject(err);
        deferred.resolve(rows);

    });

    return deferred.promise();

  }

  function GetById(id)
  {
      var deferred = $q.defer();
      var query = "SELECT * FROM urgence where isDelete = 0 and idurgence = ?";
      connection.query(query,[id],function(err,rows){
        if(err) deferred.reject(err);
        deferred.resolve(rows);
      });

      return deferred.promise;
  }

  function GetByCNI(cni)
  {
      var deferred = $q.defer();
      var query = "SELECT * FROM urgence where isDelete = 0 and cni = ?";
      connection.query(query,[cni],function(err,rows){

          if(err) deferred.reject(err);
          deferred.resolve(rows);

      });

      return deferred.promise;
  }

  function GetByName(name)
  {
      var deferred = $q.defer();
      var query = "SELECT * FROM urgence where isDelete = 0 and name like '%"+name+"%'";
      connection.query(query,function(err,rows){

          if(err) deferred.reject(err);
          deferred.resolve(rows);

      });
      return deferred.promise;
  }

  function Create(patient)
  {
      var deferred  = $q.defer();
      var query = "INSERT INTO urgence SET ? ";
      connection.query(query,patient,function(err,rows){
          if(err) deferred.reject(err);
          deferred.resolve(rows.insertId);
      });

      return deferred.promise;
  }

  function Update(patient)
  {
      var deferred = $q.defer();
      var query = "UPDATE urgence SET nom = ? , montant = ? , debutIntervale = ?, finIntervale = ? WHERE cni = ?";

      connection.query(query,[patient.nom],[patient.montant],[patient.debutIntervale],[patient.finIntervale],[patient.cni],function(err,rows){
          if(err) deferred.reject(err);
          deferred.resolve(rows);
      });

      return deferred.promise;
  }

  function TrueDelete(cni)
  {
      var deferred = $q.defer();
      var query = "DELETE FROM urgence WHERE cni = ?";

      connection.query(query,[cni],function(err,rows){
          if(err) deferred.reject(err);
          deferred.resolve(rows.affectedRows);
      });

      return  deferred.promise;
  }

  function SoftDelete(cni)
  {
      var deferred = $q.defer();
      var query = "UPDATE urgence SET isDelete = 1 WHERE cni = ?";

      connection.query(query,[cni],function(err,rows){

            if(err) deferred.reject(err);
            deferred.resolve(rows);

      });

      return deferred.promise;
  }
}

app.controller('ListBottomSheetCtrl', function($scope, $mdBottomSheet) {
$scope.items = [
  { name: 'Share', icon: 'share' },
  { name: 'Upload', icon: 'upload' },
  { name: 'Copy', icon: 'copy' },
  { name: 'Print this page', icon: 'print' },
];

$scope.listItemClick = function($index) {
  var clickedItem = $scope.items[$index];
  $mdBottomSheet.hide(clickedItem);
};
});
  app.controller('workController',workController);
  workController.$inject=['$scope','PatientService','UserService','$localStorage','$sessionStorage','$location','$mdBottomSheet','$mdSidenav', '$mdDialog'];

  function workController($scope, PatientService,UserService,$localStorage,$sessionStorage,$location,$mdBottomSheet,$mdSidenav,$mdDialog)
  {

      var work = this;
      work.goTo = goTo;


        (function initController(){
        //AuthentificationService.ClearCredentials();

        })();


          $scope.toggleSidenav = function(menuId) {
                      $mdSidenav(menuId).toggle();
          };


         	$scope.menu = [
            {
              link : '/work',
              title: 'L\'outil d\'aide',
              icon: 'dashboard'
            }          ];

          $scope.admin = [

                  {
                    link : '',
                    title : 'Statistiques des dernières visites',
                    icon : 'insert_chart'
                  }

                ];

              $scope.settings = [
                  {
                      link : '',
                      title : 'Currency',
                      icon : 'attach_money'
                  }

              ];


              $scope.activity2 = [

              ];
              $scope.preferences = [
  {
      nom : 'Si deux sites sont géographiquement proches mieux visiter les deux',
      ajout : '(Dans un rayon d\'un kilometre)',
      value : '1'

  },{
      nom : 'J\'aimerais visiter au moins un musée',
      ajout : '(Plusieurs musieurs musée si possible mais au moins un)',
      value : '2'
  },{
      nom : 'Je dois absolument visiter le Hilton',
      ajout : '(Le dernier étage du Hilton Hotel)',
      value : '3',

  },{
      nom : 'J\'aimerais visiter au moins un restaurant',
      ajout : '(Plusieurs si possible mais au moins un )',
      value : '4'
  },{
      nom : 'J\'aimerais visiter au moins un monument',
      ajout : '(Plusieurs si possible mais au moins un )',
      value : '5'
  }
  ];
              $scope.activity = [
              {
                    who : 'Palais de Congrès',
                    time : '3',
                    stars : '5',
                    amount : '0',
                    icon : '1.jpeg',
                    type : '1',
                    value : '1',
                    description : 'Le Palais des Congrès de Yaoundé est la plus grande salle de conférence du Cameroun. Situé sur une colline surplombant la ville, le Palais des Congrès offre une des plus belle vue de Yaoundé. Yaoundé, surnommée « ville aux sept collines », est la capitale politique du Cameroun depuis 1909. Peuplée de 2 440 462 habitants (en 2011), elle est, après Douala, la seconde ville de cet État de l\’Afrique centrale. C’est aussi le chef-lieu de la Région du Centre et du département du Mfoundi. Yaoundé abrite la plupart des institutions les plus importantes du Cameroun. Un autre surnom de Yaoundé est Ongola, ce qui veut dire “clôture” en se référant au mur de l\’ancien poste allemand.'

              },{
                     who : 'Monument de la Réunification',
                     time : '2',
                     stars : '5',
                     amount : '100',
                     icon : '2.jpeg',
                     type : '1',
                     value : '2',
                     description : 'Le monument de la réunification est situé à Yaoundé. Il a été construit au début des années 1970 pour célébrer la réunification du Cameroun. Le monument principal, en forme de spirale, représente deux serpents dont les têtes fusionnent1, symbole de la réunification du Cameroun français et du Cameroun britannique le 1er octobre 1961. La statue représente un vieil homme portant cinq enfants ainsi que le flambeau national '

              },{
                      who : 'Musée National',
                      time : '6',
                      stars : '5',
                      amount : '5000',
                      icon : '3.jpeg',
                      type : '1',
                      value : '3',
                      description : 'Construit à l\’époque coloniale, le bâtiment qui abrite l\’actuel musée national a tout d’abord servi de résidence au Major Hans Dominik qui fut pendant plusieurs années chef de poste allemand au Cameroun sous protectorat allemand1. Après la défaite allemande à la 1re guerre mondiale et la perte de ses colonies, le bâtiment devint palais des gouverneurs français à l\’instar de Roland Pré, André Soucadaux, Pierre Charles Cournarie et bien d\’autres jusqu\’en 19502. En 1960, après l’indépendance du Cameroun, il est pris comme résidence par Ahmadou Ahidjo, 1er président du Cameroun. C’est en 1988, sous l’initiative du 2e président de la république du Cameroun Paul Biya qu\’il est baptisé musée national3. En 2009, le musée ferme ses portes pour rénovation sous l’impulsion du ministre des arts et de la culture madame Ama Tutu Muna. Ces travaux de rénovation dureront jusqu’en 2014, année se réouverture officielle le 15 janvier4. Une soirée de gala meublera cette réouverture qui connaitra la participation de plusieurs artistes camerounais à l’instar de : X-Maleya, Stanley Enow, Kareyce Fotso, Sanzy Viany, Dynastie le Tigre,…, une danse classique du couple Maxim Beloserkovsky et Irina Dvorovenko, et bien d’autres'


              },{
                      who : 'Lac Principale',
                      time : '1',
                      stars : '3',
                      amount : '0',
                      icon : '4.jpeg',
                      type : '1',
                      value : '4',
                      description : 'Aucune info supplémentaire'
              },{
                      who : 'Bois Sainte Anastasie',
                      time : '4',
                      stars : '4',
                      amount : '1000',
                      icon : '5.jpeg',
                      type : '1',
                      value : '5',
                      description : 'Cet espace clos et gardé accueille en moyenne 150 visiteurs par jour, plus particulièrement le week-end. Les familles viennent s\’y promener ou pique-niquer, les mariés y sont pris en photo, les amoureux ont leur petit « Bois d’Amour »… Le chant des oiseaux, le bruissement des feuilles, l\’écoulement du ruisseau, tout concourt à faire de ce bois un lieu de quiétude et de sérénité où la nature est mis à l\’honneur : hibiscus, violettes, géranium, rosiers forment de jolis massifs au milieu d\’essences d’arbustes bien taillés.'
              },{
                    who : 'Statue Charles Atangana',
                     time : '1',
                     stars : '3',
                     amount : '0',
                     icon : '6.jpeg',
                     type : '1',
                     value : '6',
                     description : 'S\’il est un édifice public qui est méconnu des populations de Yaoundé , c’est bien la statue de Charles Atangana ; celui qui dès 1912, commença la construction et la modernisation de la ville aux sept collines. Mais l’œuvre d’un grand homme ne meurt pas; Un devoir de mémoire s’impose. Le 24 Mars 1914, lorsque l’administrateur allemand lui remet la chaise, les galons et les épaulettes de chef Supérieur des Ewondos, Charles Atangana a déjà intégré la formule célèbre de Zintgraff : "l’Afrique aux Africains". C’est ainsi qu’il va faire de l’évolution des peuples Béti son  affaire en posant alors les  premiers jalons de la modernisation de Yaoundé.'
              },{
                  who : 'Basilique de Mvolye',
                    time : '2',
                    stars : '5',
                    amount : '0',
                    icon : '7.jpeg',
                    type : '1',
                    value : '7',
                    description : 'Bâtie sur 12 colonnes représentant les 12 apôtres, la basilique a une hauteur de 32 mètres et une largeur de 75 mètres 2. Elle a une capacité d’accueil de près de 4 000 places assises. Sa construction est faite d’un subtil mélange de pierre, de métal et de bois (bubinga et moabi) grâce à la collaboration du savoir-faire des différentes ethnies du Cameroun. Elle abrite des tableaux extérieurs représentant les sacrements réalisés avec la collaboration du centre Nina de Mbalmayo. Les vitraux aux couleurs pastels et lumineuses sont une fresque de 100 m2 du peintre verrier Henri Guérin. La Vierge noire (3,50 m de hauteur) est sculptée dans le bois de l\’arbre sacré de Nkong Ondoa et l\’autel taillé en forme de jeton d\’abbia dans le granit à Akok Bekoé. Le Christ et le tabernacle sont réalisés en bronze avec les techniques Bamoun.'
              },{

                  who : 'Sommet Mont Fébé',
                  time : '1',
                  stars : '4',
                  amount : '0',
                  icon : '8.jpeg',
                  type : '2',
                  value : '8',
                  description :' Le Mont-Fébé est une colline verdoyante située au nord-ouest de Yaoundé. Elle culmine à 1073 mètres d\'altitude, et offre plusieurs points d\'intérêt, en partant du bas vers le sommet :    Le parcours Vita et jogging     Le Golf Club Yaoundé      Un hôtel de prestige, l\'Hôtel Mont Fébé      Le monastère des bénédictins avec une église et un musée d\'art camerounais      Un rocher contenant une grotte mariale      Une vue panoramique sur la ville de Yaoundé '
              },{
                  who : 'Grotte de Mariale Mont Fébé',
                  time : '1',
                  stars : '4',
                  amount : '0',
                  icon : '9.jpeg',
                  type : '2',
                  value : '9',
                  description : "Aucune info supplémentaire"
              },{
                  who : 'Notre dame des victoires',
                  time : '1',
                  stars : '5',
                  amount : '0',
                  icon : '10.jpeg',
                  type : '2',
                  value : '10',
                  description : 'Elle est située en plein centre-ville au rond-point de la poste centrale. D\'une architecture imposante, et d\'une grande capacité d’accueil, 5000 fidèles environ1, elle a un intérieur en forme de croix. Après plus de 50 ans d\'existence, la construction de la Cathédrale Notre-Dame-des-Victoires de Yaoundé n\'est pas encore finie. C\'est l\'un des lieux les plus marquants de la capitale.'
              },{
                  who : 'Jardin de Mvog-Beti',
                  time : '4',
                  stars : '4',
                  amount : '1000',
                  icon : '11.jpeg',
                  type :'2',
                  value : '11',
                  description : 'The Mvog-Betsi Zoo is located in Yaoundé, Cameroon and is administered by the Ministry of Forestry and Fauna (MINFOF) (formerly the Ministry of Environments and Forests (MINEF)) in Cameroon. There is a wide range of species at the zoo, including big cats, reptiles, and birds of prey. Ape Action Africa has taken responsibility for the care of the primates at the zoo'
              },{
                  who : 'Hilton Hotel',
                  time : '4',
                  stars : '4',
                  amount : '15000',
                  icon : '12.jpeg',
                  type : '2',
                  value : '12',
                  description : 'Hotel de 246 chambres possédant un casino, 3 restaurants et 2 bars. Dotée d\'une piscine extérieure et d\'une terasse sur le toit. 2 court de tennis extérieurs, Sois spa et un centre de conférence.'
              },{
                  who : 'Independance Square',
                  time : '1',
                  stars : '4',
                  amount : '0',
                  icon : '13.jpeg',
                  type : '2',
                  value : '13',
                  description : 'Aucune info supplémentaire'
              },{
                  who : 'Chefferie Ewondo',
                  time : '3',
                  stars : '3',
                  amount : '0',
                  icon : '14.jpeg',
                  type : '2',
                  value : '14',
                  description : 'Aucune info supplémentaire'
              }];
    //Cas de test
    console.log('Taille : '+$scope.activity.length);
    if($scope.activity.length==0)
    {
      $scope.cases = true;
    }
    else {
      $scope.cases = false;
    }
    console.log('Soit $scope.cases = '+$scope.cases);
  $scope.alert = '';
  $scope.pref2=false;
  $scope.change= function()
  {
    console.log(work.pref);
    if(work.pref=="OUI"){
        $scope.pref2 = true;
        $scope.pref3 = false;
    }else
    {
      $scope.pref2 = false;
    }
  }
  $scope.change2  = function()
  {
      console.log(work.preference2);
      if(work.preference2){
        $scope.plusieurs = true;
      }else
      {
        $scope.plusieurs = false;
      }
  }
  $scope.solve = function()
  {
    if(work.prix !=null && work.pref !=null && work.temps !=null && work.temps!= 0){
     console.log('Demarrage du solveur');
     var prix = work.prix;
     var heures = work.temps;
     var preference = work.pref;
     console.log('Prix : '+prix+', Heures : '+heures+', Preference : '+preference);

            var lpsolve = require('lp_solve');
            var Row = lpsolve.Row;

            var lp = new lpsolve.LinearProgram();

            var x1 = lp.addColumn('x1',true);
            var x2 = lp.addColumn('x2',true);
            var x3 = lp.addColumn('x3',true);
            var x4 = lp.addColumn('x4',true);
            var x5 = lp.addColumn('x5',true);
            var x6 = lp.addColumn('x6',true);
            var x7 = lp.addColumn('x7',true);
            var x8 = lp.addColumn('x8',true);
            var x9 = lp.addColumn('x9',true);
            var x10  = lp.addColumn('x10',true);
            var x11 = lp.addColumn('x11',true);
            var x12 = lp.addColumn('x12',true);
            var x13 = lp.addColumn('x13',true);
            var x14 = lp.addColumn('x14',true);


var objective = new Row().Add(x1, -1).Add(x2, -1).Add(x3, -1).Add(x4, -1).Add(x5, -1).Add(x6, -1).Add(x7, -1).Add(x8, -1).Add(x9, -1).Add(x10, -1).Add(x11, -1).Add(x12, -1).Add(x13, -1).Add(x14, -1);
lp.setObjective(objective);
var montant = new Row().Add(x1, 0).Add(x2,100).Add(x3,5000).Add(x4,0).Add(x5,1000).Add(x6,0).Add(x7,0).Add(x8,0).Add(x9,0).Add(x10,0).Add(x11,1000).Add(x12,15000).Add(x13,0).Add(x14,0);
lp.addConstraint(montant, 'LE', prix, 'machine a time');
var heure = new Row().Add(x1,3).Add(x2,2).Add(x3,6).Add(x4,1).Add(x5,4).Add(x6,1).Add(x7,2).Add(x8,1).Add(x9,1).Add(x10,1).Add(x11,4).Add(x12,4).Add(x13,1).Add(x14,3);
lp.addConstraint(heure,'LE',heures, 'machine b time');
var cons1 = new Row().Add(x1,1); lp.addConstraint(cons1,'LE',1,'1');
var cons2  = new Row().Add(x2,1); lp.addConstraint(cons2,'LE',1,'2');
var cons3 = new Row().Add(x3,1); lp.addConstraint(cons3,'LE',1,'3');
var cons4 = new Row().Add(x4,1); lp.addConstraint(cons4,'LE',1,'4');
var cons5 = new Row().Add(x5,1);lp.addConstraint(cons5,'LE',1,'5');
var cons6 = new Row().Add(x6,1);lp.addConstraint(cons6,'LE',1,'6');
var cons7 = new Row().Add(x7,1); lp.addConstraint(cons7,'LE',1,'7');
var cons8 = new Row().Add(x8,1);lp.addConstraint(cons8,'LE',1,'8');
var cons9 = new Row().Add(x9,1); lp.addConstraint(cons9,'LE',1,'9');
var cons10 = new Row().Add(x10,1); lp.addConstraint(cons10,'LE',1,'10');
var cons11 = new Row().Add(x11,1); lp.addConstraint(cons11,'LE',1,'11');
var cons12 = new Row().Add(x12,1); lp.addConstraint(cons12,'LE',1,'12');
var cons13 = new Row().Add(x13,1); lp.addConstraint(cons13,'LE',1,'13');
var cons14 = new Row().Add(x14,1); lp.addConstraint(cons14,'LE',1,'14');
     if(preference=='NON'){

     }else
     {
        if(work.preference1)
        {
var cons15 = new Row().Add(x8,1).Add(x9,-1);lp.addConstraint(cons15,'LE',0,'15');lp.addConstraint(cons15,'GE',0,'16');
var cons16 = new Row().Add(x10,1).Add(x11,-1);lp.addConstraint(cons16,'LE',0,'17');lp.addConstraint(cons16,'GE',0,'18');
var cons17 = new Row().Add(x10,1).Add(x3,-1); lp.addConstraint(cons17,'LE',0,'18');lp.addConstraint(cons17,'GE',0,'19');
var cons18 = new Row().Add(x10,1).Add(x6,-1); lp.addConstraint(cons18,'LE',0,'20');lp.addConstraint(cons18,'GE',0,'21');
var cons19 = new Row().Add(x12,1).Add(x13,-1); lp.addConstraint(cons19,'LE',0,'22');lp.addConstraint(cons19,'GE',0,'23');
var cons20 = new Row().Add(x12,1).Add(x5,-1); lp.addConstraint(cons20,'LE',0,'24');lp.addConstraint(cons20,'GE',0,'24');
var cons21 = new Row().Add(x5,1).Add(x6,-1); lp.addConstraint(cons21,'LE',0,'25');lp.addConstraint(cons21,'GE',0,'26');
        }
        if(work.preference2){
var cons22 = new Row().Add(x3,1); lp.addConstraint(cons22,'LE',1,'27'); lp.addConstraint(cons22,'GE',1,'28');
        }
        if(work.preference3){
var cons23 = new Row().Add(x12,1); lp.addConstraint(cons23,'LE',1,'29'); lp.addConstraint(cons23,'GE',1,'30');
        }
        if(work.preference4){
var cons24 = new Row().Add(x5,1).Add(x12,1).Add(x8,1); lp.addConstraint(cons24,'GE',1,'31');
        }
        if(work.preference5){
var cons25 = new Row().Add(x2,1).Add(x13,1); lp.addConstraint(cons25,'GE',1,'32');
        }
     }

     if(work.preference2){
        var i = 0;
        if(work.sitesAbs!=null){
          console.log(work.sitesAbs+'0'+work.sitesAbs[2]);
        for(i=0; i<work.sitesAbs.length;i++)
        {
          if(work.sitesAbs[i]=='1'){
            cons25 = new Row().Add(x1,1); lp.addConstraint(cons25,'LE',1,'33'+i); lp.addConstraint(cons25,'GE',1,'34'+i);
          }if(work.sitesAbs[i]=='2'){
            cons25 = new Row().Add(x2,1); lp.addConstraint(cons25,'LE',1,'33'+i); lp.addConstraint(cons25,'GE',1,'34'+i);
          }if(work.sitesAbs[i]=='3'){
cons25 = new Row().Add(x3,1); lp.addConstraint(cons25,'LE',1,'33'+i); lp.addConstraint(cons25,'GE',1,'34'+i);
          }if(work.sitesAbs[i]=='4'){
cons25 = new Row().Add(x4,1); lp.addConstraint(cons25,'LE',1,'33'+i); lp.addConstraint(cons25,'GE',1,'34'+i);
          }if(work.sitesAbs[i]=='5'){
cons25 = new Row().Add(x5,1); lp.addConstraint(cons25,'LE',1,'33'+i); lp.addConstraint(cons25,'GE',1,'34'+i);
          }if(work.sitesAbs[i]=='6'){
cons25 = new Row().Add(x6,1); lp.addConstraint(cons25,'LE',1,'33'+i); lp.addConstraint(cons25,'GE',1,'34'+i);
          }if(work.sitesAbs[i]=='7'){
cons25 = new Row().Add(x7,1); lp.addConstraint(cons25,'LE',1,'33'+i); lp.addConstraint(cons25,'GE',1,'34'+i);
          }if(work.sitesAbs[i]=='8'){
cons25 = new Row().Add(x8,1); lp.addConstraint(cons25,'LE',1,'33'+i); lp.addConstraint(cons25,'GE',1,'34'+i);
          }if(work.sitesAbs[i]=='9'){
cons25 = new Row().Add(x9,1); lp.addConstraint(cons25,'LE',1,'33'+i); lp.addConstraint(cons25,'GE',1,'34'+i);
          }if(work.sitesAbs[i]=='10'){
cons25 = new Row().Add(x10,1); lp.addConstraint(cons25,'LE',1,'33'+i); lp.addConstraint(cons25,'GE',1,'34'+i);
          }if(work.sitesAbs[i]=='11'){
cons25 = new Row().Add(x11,1); lp.addConstraint(cons25,'LE',1,'33'+i); lp.addConstraint(cons25,'GE',1,'34'+i);
          }if(work.sitesAbs[i]=='12'){
cons25 = new Row().Add(x12,1); lp.addConstraint(cons25,'LE',1,'33'+i); lp.addConstraint(cons25,'GE',1,'34'+i);
          }if(work.sitesAbs[i]=='13'){
cons25 = new Row().Add(x13,1); lp.addConstraint(cons25,'LE',1,'33'+i); lp.addConstraint(cons25,'GE',1,'34'+i);
          }if(work.sitesAbs[i]=='14'){
cons25 = new Row().Add(x14,1); lp.addConstraint(cons25,'LE',1,'33'+i); lp.addConstraint(cons25,'GE',1,'34'+i);
          }

        }}


     }
console.log(lp.dumpProgram());
console.log(lp.solve());
console.log('objective =', lp.getObjectiveValue())
console.log('x1 = '+lp.get(x1)+', x2 = '+lp.get(x2)+', x3 = '+lp.get(x3)+', x4 = '+lp.get(x4)+', x5 = '+lp.get(x5)+',x6= '+lp.get(x6)+', x7 = '+lp.get(x7)+', x8 = '+lp.get(x8)+',x9 = '+lp.get(x9)+', x10 = '+lp.get(x10)+',x11 = '+lp.get(x11)+', x12 = '+lp.get(x12)+', x13 = '+lp.get(x13)+', x14 = '+lp.get(x14));
console.log('machineatime =', lp.calculate(montant));
console.log('machinebtime =', lp.calculate(heure));

$scope.results = [];
$scope.result = "";
if(lp.get(x1)==1){
  $scope.results.push(  {
          who : 'Palais de Congrès',
          time : '3',
          stars : '5',
          amount : '0',
          icon : '1.jpeg',
          type : '1',
          value : '1',
            description : 'Le Palais des Congrès de Yaoundé est la plus grande salle de conférence du Cameroun. Situé sur une colline surplombant la ville, le Palais des Congrès offre une des plus belle vue de Yaoundé. Yaoundé, surnommée « ville aux sept collines », est la capitale politique du Cameroun depuis 1909. Peuplée de 2 440 462 habitants (en 2011), elle est, après Douala, la seconde ville de cet État de l\’Afrique centrale. C’est aussi le chef-lieu de la Région du Centre et du département du Mfoundi. Yaoundé abrite la plupart des institutions les plus importantes du Cameroun. Un autre surnom de Yaoundé est Ongola, ce qui veut dire “clôture” en se référant au mur de l\’ancien poste allemand.'

    });
  $scope.result = $scope.result + '\n- Palais des congrès';
}
if(lp.get(x2)==1){
  $scope.result = $scope.result + '\n- Monument de la réunification';
  $scope.results.push({
         who : 'Monument de la Réunification',
         time : '2',
         stars : '5',
         amount : '100',
         icon : '2.jpeg',
         type : '1',
         value : '2',
         description : 'Le monument de la réunification est situé à Yaoundé. Il a été construit au début des années 1970 pour célébrer la réunification du Cameroun. Le monument principal, en forme de spirale, représente deux serpents dont les têtes fusionnent1, symbole de la réunification du Cameroun français et du Cameroun britannique le 1er octobre 1961. La statue représente un vieil homme portant cinq enfants ainsi que le flambeau national '

  });
}
if(lp.get(x3)==1){
  $scope.result = $scope.result + '\n- Musée National';
  $scope.results.push({
          who : 'Musée National',
          time : '6',
          stars : '5',
          amount : '5000',
          icon : '3.jpeg',
          type : '1',
          value : '3',
          description : 'Construit à l\’époque coloniale, le bâtiment qui abrite l\’actuel musée national a tout d’abord servi de résidence au Major Hans Dominik qui fut pendant plusieurs années chef de poste allemand au Cameroun sous protectorat allemand1. Après la défaite allemande à la 1re guerre mondiale et la perte de ses colonies, le bâtiment devint palais des gouverneurs français à l\’instar de Roland Pré, André Soucadaux, Pierre Charles Cournarie et bien d\’autres jusqu\’en 19502. En 1960, après l’indépendance du Cameroun, il est pris comme résidence par Ahmadou Ahidjo, 1er président du Cameroun. C’est en 1988, sous l’initiative du 2e président de la république du Cameroun Paul Biya qu\’il est baptisé musée national3. En 2009, le musée ferme ses portes pour rénovation sous l’impulsion du ministre des arts et de la culture madame Ama Tutu Muna. Ces travaux de rénovation dureront jusqu’en 2014, année se réouverture officielle le 15 janvier4. Une soirée de gala meublera cette réouverture qui connaitra la participation de plusieurs artistes camerounais à l’instar de : X-Maleya, Stanley Enow, Kareyce Fotso, Sanzy Viany, Dynastie le Tigre,…, une danse classique du couple Maxim Beloserkovsky et Irina Dvorovenko, et bien d’autres'

  });
}
if(lp.get(x4)==1){
  $scope.result = $scope.result + '\n- Lac Principale';
  $scope.results.push({
          who : 'Lac Principale',
          time : '1',
          stars : '3',
          amount : '0',
          icon : '4.jpeg',
          type : '1',
          value : '4',
          description : 'Aucune info supplémentaire'

  });
}
if(lp.get(x5)==1){
  $scope.result = $scope.result + '\n- Bois Sainte Anastasie';
  $scope.results.push({
          who : 'Bois Sainte Anastasie',
          time : '4',
          stars : '4',
          amount : '1000',
          icon : '5.jpeg',
          type : '1',
          value : '5',
          description : 'Cet espace clos et gardé accueille en moyenne 150 visiteurs par jour, plus particulièrement le week-end. Les familles viennent s\’y promener ou pique-niquer, les mariés y sont pris en photo, les amoureux ont leur petit « Bois d’Amour »… Le chant des oiseaux, le bruissement des feuilles, l\’écoulement du ruisseau, tout concourt à faire de ce bois un lieu de quiétude et de sérénité où la nature est mis à l\’honneur : hibiscus, violettes, géranium, rosiers forment de jolis massifs au milieu d\’essences d’arbustes bien taillés.'
  });
}
if(lp.get(x6)==1){
  $scope.result = $scope.result + '\n- Statue Charles Atangana';
  $scope.results.push({
        who : 'Statue Charles Atangana',
         time : '1',
         stars : '3',
         amount : '0',
         icon : '6.jpeg',
         type : '1',
         value : '6',
        description : 'S\’il est un édifice public qui est méconnu des populations de Yaoundé , c’est bien la statue de Charles Atangana ; celui qui dès 1912, commença la construction et la modernisation de la ville aux sept collines. Mais l’œuvre d’un grand homme ne meurt pas; Un devoir de mémoire s’impose. Le 24 Mars 1914, lorsque l’administrateur allemand lui remet la chaise, les galons et les épaulettes de chef Supérieur des Ewondos, Charles Atangana a déjà intégré la formule célèbre de Zintgraff : "l’Afrique aux Africains". C’est ainsi qu’il va faire de l’évolution des peuples Béti son  affaire en posant alors les  premiers jalons de la modernisation de Yaoundé.'
  });
}
if(lp.get(x7)==1){
  $scope.result = $scope.result + '\n- Basilique de Mvolye';
  $scope.results.push({
      who : 'Basilique de Mvolye',
        time : '2',
        stars : '5',
        amount : '0',
        icon : '7.jpeg',
        type : '1',
        value : '7',
        description : 'Bâtie sur 12 colonnes représentant les 12 apôtres, la basilique a une hauteur de 32 mètres et une largeur de 75 mètres 2. Elle a une capacité d’accueil de près de 4 000 places assises. Sa construction est faite d’un subtil mélange de pierre, de métal et de bois (bubinga et moabi) grâce à la collaboration du savoir-faire des différentes ethnies du Cameroun. Elle abrite des tableaux extérieurs représentant les sacrements réalisés avec la collaboration du centre Nina de Mbalmayo. Les vitraux aux couleurs pastels et lumineuses sont une fresque de 100 m2 du peintre verrier Henri Guérin. La Vierge noire (3,50 m de hauteur) est sculptée dans le bois de l\’arbre sacré de Nkong Ondoa et l\’autel taillé en forme de jeton d\’abbia dans le granit à Akok Bekoé. Le Christ et le tabernacle sont réalisés en bronze avec les techniques Bamoun.'
  });
}
if(lp.get(x8)==1){
  $scope.result = $scope.result + '\n- Sommet Mont Fébé';
  $scope.results.push({

      who : 'Sommet Mont Fébé',
      time : '1',
      stars : '4',
      amount : '0',
      icon : '8.jpeg',
      type : '2',
      value : '8',
      description :' Le Mont-Fébé est une colline verdoyante située au nord-ouest de Yaoundé. Elle culmine à 1073 mètres d\'altitude, et offre plusieurs points d\'intérêt, en partant du bas vers le sommet :    Le parcours Vita et jogging     Le Golf Club Yaoundé      Un hôtel de prestige, l\'Hôtel Mont Fébé      Le monastère des bénédictins avec une église et un musée d\'art camerounais      Un rocher contenant une grotte mariale      Une vue panoramique sur la ville de Yaoundé '
  });
}
if(lp.get(x9)==1){
  $scope.result = $scope.result + '\n- Grotte de Mariale Mont Fébé';
  $scope.results.push({
      who : 'Grotte de Mariale Mont Fébé',
      time : '1',
      stars : '4',
      amount : '0',
      icon : '9.jpeg',
      type : '2',
      value : '9',
      description : "Aucune info supplémentaire"
  });
}
if(lp.get(x10)==1){
  $scope.result = $scope.result + '\n- Notre dame des victoires';
  $scope.results.push({
      who : 'Notre dame des victoires',
      time : '1',
      stars : '5',
      amount : '0',
      icon : '10.jpeg',
      type : '2',
      value : '10',
      description : 'Elle est située en plein centre-ville au rond-point de la poste centrale. D\'une architecture imposante, et d\'une grande capacité d’accueil, 5000 fidèles environ1, elle a un intérieur en forme de croix. Après plus de 50 ans d\'existence, la construction de la Cathédrale Notre-Dame-des-Victoires de Yaoundé n\'est pas encore finie. C\'est l\'un des lieux les plus marquants de la capitale.'
  });
}
if(lp.get(x11)==1){
  $scope.result = $scope.result + '\n- Jardin de Mvog-Beti';
  $scope.results.push({
      who : 'Jardin de Mvog-Beti',
      time : '4',
      stars : '4',
      amount : '1000',
      icon : '11.jpeg',
      type :'2',
      value : '11',
        description : 'The Mvog-Betsi Zoo is located in Yaoundé, Cameroon and is administered by the Ministry of Forestry and Fauna (MINFOF) (formerly the Ministry of Environments and Forests (MINEF)) in Cameroon. There is a wide range of species at the zoo, including big cats, reptiles, and birds of prey. Ape Action Africa has taken responsibility for the care of the primates at the zoo'
  });
}
if(lp.get(x12)==1){
  $scope.result = $scope.result + '\n- Hilton Hotel';
  $scope.results.push({
      who : 'Hilton Hotel',
      time : '4',
      stars : '4',
      amount : '15000',
      icon : '12.jpeg',
      type : '2',
      value : '12',
        description : 'Hotel de 246 chambres possédant un casino, 3 restaurants et 2 bars. Dotée d\'une piscine extérieure et d\'une terasse sur le toit. 2 court de tennis extérieurs, Sois spa et un centre de conférence.'
  });
}
if(lp.get(x13)==1){
  $scope.result = $scope.result + '\n- Independance Square';
  $scope.results.push({
      who : 'Independance Square',
      time : '1',
      stars : '4',
      amount : '0',
      icon : '13.jpeg',
      type : '2',
      value : '13',
      description : 'Aucune info supplémentaire'
  });
}
if(lp.get(x14)==1){
  $scope.result = $scope.result + '\n- Chefferie Ewondo';
  $scope.results.push({
      who : 'Chefferie Ewondo',
      time : '3',
      stars : '3',
      amount : '0',
      icon : '14.jpeg',
      type : '2',
      value : '14',
      description : 'Aucune info supplémentaire'
  });
}
$scope.resultats = {cout : ''+lp.calculate(montant),heures : ''+lp.calculate(heure),nombre : ''+$scope.results.length};
console.log($scope.results);
$scope.pref3 = true;
$scope.pref2 = false;
work.pref = "";
}else{
  //Modal remplir tous les champs
  $mdDialog.show(
     $mdDialog.alert()
       .parent(null)
       .clickOutsideToClose(true)
       .title('ALERT')
       .textContent('Veuillez remplir tous les champs.')
       .ariaLabel('Alerte')
       .ok('OK')
       .targetEvent(null)

   );
}
  }

  $scope.showInfo = function(item){
    $mdDialog.show(
       $mdDialog.alert()
         .parent(null)
         .clickOutsideToClose(true)
         .title('PLUS D\'INFO  SUR '+item.who)
         .textContent(item.description)
         .ariaLabel('MORE')
         .ok('OK')
         .targetEvent(null)

     );
  }
$scope.showListBottomSheet = function($event) {
  $scope.alert = '';
  $mdBottomSheet.show({
    template: '<md-bottom-sheet class="md-list md-has-header"> <md-subheader>Settings</md-subheader> <md-list> <md-item ng-repeat="item in items"><md-item-content md-ink-ripple flex class="inset"> <a flex aria-label="{{item.name}}" ng-click="listItemClick($index)"> <span class="md-inline-list-icon-label">{{ item.name }}</span> </a></md-item-content> </md-item> </md-list></md-bottom-sheet>',
    controller: 'ListBottomSheetCtrl',
    targetEvent: $event
  }).then(function(clickedItem) {
    $scope.alert = clickedItem.name + ' clicked!';
  });
};
$scope.goTo = function(link)
{
   window.location.assign("index.html#tab2-content");
};
$scope.showAdd = function(ev) {
  $mdDialog.show({
    controller: DialogController,
    templateUrl: 'pref.html',
    targetEvent: ev,
    clickOutsideToClose:true,
  })
  .then(function(answer) {
    $scope.alert = 'You said the information was "' + answer + '".';
  }, function() {
    $scope.alert = 'You cancelled the dialog.';
  });
};







                function goTo(link)
                {
                   $location.path(link);
                }

  }


function DialogController($scope, $mdDialog) {
  var diag = this;

  diag.change = change;

      $scope.pref= false;
      $scope.pref2 = false;
      $scope.myDate = new Date();
      $scope.min =new Date(
      $scope.myDate.getFullYear(),
      $scope.myDate.getMonth(),
      $scope.myDate.getDate());

      if($scope.pref){
        console.log($scope.pref);
        $scope.pref2 = true;
      }else{
        console.log($scope.pref);
        $scope.pref2=false;
      }

      function change()
      {
        console.log('Je change et la valeur est '+$scope.pref)

      }

    var _video = null,
        patData = null;

    $scope.patOpts = {x: 0, y: 0, w: 25, h: 25};

    // Setup a channel to receive a video property
    // with a reference to the video element
    // See the HTML binding in main.html
    $scope.channel = {};

    $scope.webcamError = false;
    $scope.onError = function (err) {
        $scope.$apply(
            function() {
                $scope.webcamError = err;
            }
        );
    };

    $scope.onSuccess = function () {
        // The video element contains the captured camera data
        _video = $scope.channel.video;
        $scope.$apply(function() {
            $scope.patOpts.w = _video.width;
            $scope.patOpts.h = _video.height;
            //$scope.showDemos = true;
        });
    };

    $scope.onStream = function (stream) {
        // You could do something manually with the stream.
    };

	$scope.makeSnapshot = function() {
        if (_video) {
            var patCanvas = document.querySelector('#snapshot');
            if (!patCanvas) return;

            patCanvas.width = _video.width;
            patCanvas.height = _video.height;
            var ctxPat = patCanvas.getContext('2d');

            var idata = getVideoData($scope.patOpts.x, $scope.patOpts.y, $scope.patOpts.w, $scope.patOpts.h);
            ctxPat.putImageData(idata, 0, 0);

            sendSnapshotToServer(patCanvas.toDataURL());

            patData = idata;
        }
    };

    /**
     * Redirect the browser to the URL given.
     * Used to download the image by passing a dataURL string
     */
    $scope.downloadSnapshot = function downloadSnapshot(dataURL) {
        window.location.href = dataURL;
    };

    var getVideoData = function getVideoData(x, y, w, h) {
        var hiddenCanvas = document.createElement('canvas');
        hiddenCanvas.width = _video.width;
        hiddenCanvas.height = _video.height;
        var ctx = hiddenCanvas.getContext('2d');
        ctx.drawImage(_video, 0, 0, _video.width, _video.height);
        return ctx.getImageData(x, y, w, h);
    };

    /**
     * This function could be used to send the image data
     * to a backend server that expects base64 encoded images.
     *
     * In this example, we simply store it in the scope for display.
     */
    var sendSnapshotToServer = function sendSnapshotToServer(imgBase64) {
        $scope.snapshotData = imgBase64;
    };

  $scope.hide = function() {
    $mdDialog.hide();
  };
  $scope.cancel = function() {
    $mdDialog.cancel();
  };
  $scope.answer = function(answer) {
    $mdDialog.hide(answer);
  };
};


  app.directive('userAvatar', function() {
    return {
      replace: true,
      template: '<svg class="user-avatar" viewBox="0 0 128 128" height="64" width="64" pointer-events="none" display="block" > <path fill="#FF8A80" d="M0 0h128v128H0z"/> <path fill="#FFE0B2" d="M36.3 94.8c6.4 7.3 16.2 12.1 27.3 12.4 10.7-.3 20.3-4.7 26.7-11.6l.2.1c-17-13.3-12.9-23.4-8.5-28.6 1.3-1.2 2.8-2.5 4.4-3.9l13.1-11c1.5-1.2 2.6-3 2.9-5.1.6-4.4-2.5-8.4-6.9-9.1-1.5-.2-3 0-4.3.6-.3-1.3-.4-2.7-1.6-3.5-1.4-.9-2.8-1.7-4.2-2.5-7.1-3.9-14.9-6.6-23-7.9-5.4-.9-11-1.2-16.1.7-3.3 1.2-6.1 3.2-8.7 5.6-1.3 1.2-2.5 2.4-3.7 3.7l-1.8 1.9c-.3.3-.5.6-.8.8-.1.1-.2 0-.4.2.1.2.1.5.1.6-1-.3-2.1-.4-3.2-.2-4.4.6-7.5 4.7-6.9 9.1.3 2.1 1.3 3.8 2.8 5.1l11 9.3c1.8 1.5 3.3 3.8 4.6 5.7 1.5 2.3 2.8 4.9 3.5 7.6 1.7 6.8-.8 13.4-5.4 18.4-.5.6-1.1 1-1.4 1.7-.2.6-.4 1.3-.6 2-.4 1.5-.5 3.1-.3 4.6.4 3.1 1.8 6.1 4.1 8.2 3.3 3 8 4 12.4 4.5 5.2.6 10.5.7 15.7.2 4.5-.4 9.1-1.2 13-3.4 5.6-3.1 9.6-8.9 10.5-15.2M76.4 46c.9 0 1.6.7 1.6 1.6 0 .9-.7 1.6-1.6 1.6-.9 0-1.6-.7-1.6-1.6-.1-.9.7-1.6 1.6-1.6zm-25.7 0c.9 0 1.6.7 1.6 1.6 0 .9-.7 1.6-1.6 1.6-.9 0-1.6-.7-1.6-1.6-.1-.9.7-1.6 1.6-1.6z"/> <path fill="#E0F7FA" d="M105.3 106.1c-.9-1.3-1.3-1.9-1.3-1.9l-.2-.3c-.6-.9-1.2-1.7-1.9-2.4-3.2-3.5-7.3-5.4-11.4-5.7 0 0 .1 0 .1.1l-.2-.1c-6.4 6.9-16 11.3-26.7 11.6-11.2-.3-21.1-5.1-27.5-12.6-.1.2-.2.4-.2.5-3.1.9-6 2.7-8.4 5.4l-.2.2s-.5.6-1.5 1.7c-.9 1.1-2.2 2.6-3.7 4.5-3.1 3.9-7.2 9.5-11.7 16.6-.9 1.4-1.7 2.8-2.6 4.3h109.6c-3.4-7.1-6.5-12.8-8.9-16.9-1.5-2.2-2.6-3.8-3.3-5z"/> <circle fill="#444" cx="76.3" cy="47.5" r="2"/> <circle fill="#444" cx="50.7" cy="47.6" r="2"/> <path fill="#444" d="M48.1 27.4c4.5 5.9 15.5 12.1 42.4 8.4-2.2-6.9-6.8-12.6-12.6-16.4C95.1 20.9 92 10 92 10c-1.4 5.5-11.1 4.4-11.1 4.4H62.1c-1.7-.1-3.4 0-5.2.3-12.8 1.8-22.6 11.1-25.7 22.9 10.6-1.9 15.3-7.6 16.9-10.2z"/> </svg>'
    };
  });

      app.config(function($mdThemingProvider) {
        var customBlueMap = 		$mdThemingProvider.extendPalette('light-blue', {
          'contrastDefaultColor': 'light',
          'contrastDarkColors': ['50'],
          '50': 'ffffff'
        });
        $mdThemingProvider.definePalette('customBlue', customBlueMap);
        $mdThemingProvider.theme('default')
          .primaryPalette('customBlue', {
            'default': '500',
            'hue-1': '50'
          })
          .accentPalette('pink');
        $mdThemingProvider.theme('input', 'default')
              .primaryPalette('grey')
      });
