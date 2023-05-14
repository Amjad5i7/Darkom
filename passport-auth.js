module.exports = {
    ensureAuthenticated: function(req, res, next) {
      if (req.isAuthenticated()) {
        return next();
      }
    console.log("req.session",req.session)
    res.render('pages/home', { url: 'pageone', title: 'Darkom | Home Page', baseUrl: req.baseUrl,loggedIn:false,session: req.session })
    },
    forwardAuthenticated: function(req, res, next) {
      if (!req.isAuthenticated()) {
        return next();
      }
      res.render('pages/home', { url: 'pageone', title: 'Darkom | Home Page', baseUrl: req.baseUrl,loggedIn:false })   
    }
  };
  