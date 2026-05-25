export default {
    viewRender(ejsName) {
        return (req, res, next) => {
            res.render(ejsName);
    }
}
}