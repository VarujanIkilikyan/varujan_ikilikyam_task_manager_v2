export default {
    notFound: (req, res, next) => {
        res.status(404).render('404')
    },
    errors: (err, req, res, next) => {
        res.status(err.status|| 500).json({
            message: err.message,
            errors: err.errors ? err.errors : {}
        })

    }
}