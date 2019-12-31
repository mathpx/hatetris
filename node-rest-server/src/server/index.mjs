
import swagger from "swagger2";
import swaggerKoa from "swagger2-koa";
import Router from "koa-router";
import * as game from "./controllers/game";

const { ui, router: swaggerRouter } = swaggerKoa;

const doc = swagger.loadDocumentSync("./swagger.yml");
const api = swaggerRouter(doc);

api.post("/game", async ctx=> {
	ctx.status = 200;
	const id = game.make();
	ctx.body = {
		id,
	};
});

api.get("/game/:id", async ctx=> {
	ctx.status = 200;
	const id = ctx.params.id;
	const state = game.state(id);
	ctx.body = state;
});

api.put("/game/:id", async ctx=> {
	ctx.status = 200;
	const id = ctx.params.id;
	const state = game.move(id, ctx.query.action);
	ctx.body = state;
});

const router = new Router();

const PREFIX_DOCS = "/docs";

router.get("/", ctx => ctx.redirect(`${PREFIX_DOCS}${doc.basePath}`));

api.app()
	.use(router.routes())
	.use(router.allowedMethods())
	.use(ui(doc, `${PREFIX_DOCS}${doc.basePath}`))
	.use(ctx => {
		ctx.status = 404;
		ctx.body = "Not found";
	})
	.listen(3000);
