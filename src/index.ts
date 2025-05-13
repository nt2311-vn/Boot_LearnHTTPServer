import express, { NextFunction, Request, Response } from "express";

const app = express();
const PORT = 8080;
const middlewareLogResponses = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  res.on("finish", () => {
    const statusCode = res.statusCode;

    if (statusCode >= 300) {
      console.log(`[NON-OK] ${req.method} ${req.url} - Status: ${statusCode}`);
    }
  });

  next();
};

app.use(middlewareLogResponses);
app.use("/app", express.static("./src/app"));

const handlerReadiness = async (req: Request, res: Response): Promise<void> => {
  res.set("Content-Type", "text");
  res.status(200).send("OK");
};

app.get("/healthz", handlerReadiness);

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
