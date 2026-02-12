import nodemailer, { SendMailOptions, SentMessageInfo, Transporter } from 'nodemailer';

type SmtpConfig = {
  host: string;
  port: number;
  user?: string;
  pass?: string;
  fromName?: string;
};

let verifiedTransporterPromise: Promise<Transporter> | null = null;
let queuePromise: Promise<void> = Promise.resolve();
let sentInBatch = 0;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const getSmtpConfig = (): SmtpConfig => {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const fromName = process.env.SMTP_FROM_NAME;

  if (!host || !port) {
    throw new Error('SMTP no configurado');
  }

  return { host, port, user, pass, fromName };
};

const getVerifiedTransporter = async () => {
  if (verifiedTransporterPromise) return verifiedTransporterPromise;
  verifiedTransporterPromise = (async () => {
    const { host, port, user, pass } = getSmtpConfig();
    const secure = port === 465;
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      pool: true,
      maxConnections: Number(process.env.SMTP_MAX_CONNECTIONS || 2),
      maxMessages: Number(process.env.SMTP_MAX_MESSAGES || 50),
      rateDelta: Number(process.env.SMTP_RATE_DELTA_MS || 60000),
      rateLimit: Number(process.env.SMTP_RATE_LIMIT || 40),
      connectionTimeout: Number(process.env.SMTP_CONNECTION_TIMEOUT_MS || 10000),
      greetingTimeout: Number(process.env.SMTP_GREETING_TIMEOUT_MS || 10000),
      socketTimeout: Number(process.env.SMTP_SOCKET_TIMEOUT_MS || 20000),
      tls: { rejectUnauthorized: false },
      auth: user && pass ? { user, pass } : undefined
    });

    await transporter.verify();
    return transporter;
  })();
  return verifiedTransporterPromise;
};

const getFromAddress = () => {
  const { fromName, user } = getSmtpConfig();
  if (!fromName || !user) return '';
  return `"${fromName}" <${user}>`;
};

const getRateLimits = () => {
  const batchSize = Number(process.env.SMTP_BATCH_SIZE || 20);
  const batchDelayMs = Number(process.env.SMTP_BATCH_DELAY_MS || 120000);
  const messageDelayMs = Number(process.env.SMTP_MESSAGE_DELAY_MS || 1000);
  return { batchSize, batchDelayMs, messageDelayMs };
};

export const sendMailQueued = async (options: SendMailOptions): Promise<SentMessageInfo> => {
  const { batchSize, batchDelayMs, messageDelayMs } = getRateLimits();
  const sendPromise = queuePromise.then(async () => {
    if (sentInBatch >= batchSize) {
      sentInBatch = 0;
      await sleep(batchDelayMs);
    }

    const transporter = await getVerifiedTransporter();
    const info = await transporter.sendMail(options);
    sentInBatch += 1;

    if (messageDelayMs > 0) {
      await sleep(messageDelayMs);
    }

    return info;
  });

  queuePromise = sendPromise.then(
    () => undefined,
    () => undefined
  );

  return sendPromise;
};

export const buildFromAddress = () => {
  const from = getFromAddress();
  if (!from) {
    throw new Error('SMTP no configurado');
  }
  return from;
};
