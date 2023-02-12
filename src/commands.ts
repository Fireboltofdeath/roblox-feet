import path from "path";
import fs from "fs";
import { Command } from "commander";

interface FeetConfig {
	rootDir: string;
	outDir?: string;
	project: string;
	baseProject: string;
	data: string;
}

interface FeetFeature {
	path: string;
	mode: "server" | "client" | "folder";
}

interface FeetData {
	features: FeetFeature[];
}

interface AddOptions {
	server: boolean;
	client: boolean;
	shared?: boolean;
}

interface RemoveOptions {
	preserve: boolean;
}

export function handleAddCommand(featPath: string, options: AddOptions, command: Command) {
	const config = loadFeetConfig();
	const rootDir = path.resolve(config.rootDir);
	const data = loadFeetData(config);
	if (data.features.find((v) => v.path === featPath)) {
		command.error(`feature '${featPath}' already exists`);
	}

	const featRoot = path.join(rootDir, featPath);
	if (!fs.existsSync(featRoot)) {
		fs.mkdirSync(featRoot, { recursive: true });

		if (!options.server && !options.client) {
			fs.mkdirSync(path.join(rootDir, featPath, "server"));
			fs.mkdirSync(path.join(rootDir, featPath, "client"));
			if (options.shared) fs.mkdirSync(path.join(rootDir, featPath, "shared"));
		}
	} else {
		command.error(`'${featPath}' already exists, cannot create feature`);
	}

	data.features.push({ path: featPath, mode: options.server ? "server" : options.client ? "client" : "folder" });

	saveFeetData(config, data);
	syncRojo(config, data);
}

export function handleRemoveCommand(featPath: string, options: RemoveOptions, command: Command) {
	const config = loadFeetConfig();
	const rootDir = path.resolve(config.rootDir);
	const data = loadFeetData(config);
	const feat = data.features.find((v) => v.path === featPath);
	if (!feat) {
		command.error(`feature '${feat}' does not exist`);
	}

	const featRoot = path.join(rootDir, feat.path);
	if (fs.existsSync(featRoot) && !options.preserve) {
		const defaultPaths = ["server", "client", "shared"];
		const directory = fs.readdirSync(featRoot);

		if (feat.mode === "folder") {
			for (const item of directory) {
				if (!defaultPaths.includes(item)) {
					command.error(`feature item '${item}' is unknown, can't remove feature`);
				}

				const directory = fs.readdirSync(path.join(featRoot, item));
				if (directory.length !== 0) {
					command.error(`feature contains non-empty '${item}' directory`);
				}

				fs.rmdirSync(path.join(featRoot, item));
			}
		} else {
			if (directory.length !== 0) {
				command.error(`${feat.mode} feature '${feat.path}' is not empty`);
			}
		}

		fs.rmdirSync(featRoot);
	}

	data.features.splice(data.features.indexOf(feat), 1);

	saveFeetData(config, data);
	syncRojo(config, data);
}

function syncRojo({ baseProject: location, project, outDir, rootDir }: FeetConfig, data: FeetData) {
	const projectPath = path.resolve(project);
	const basePath = path.resolve(location);
	const baseProject = JSON.parse(fs.readFileSync(basePath, { encoding: "ascii" }));
	const isTypeScript = fs.existsSync(path.resolve("tsconfig.json"));

	for (const feat of data.features) {
		const outputPath = outDir ?? (isTypeScript ? "out" : rootDir);
		const featPath = feat.path.split("/");

		if (feat.mode === "folder") {
			const replicatedStorage = createPath(baseProject.tree.ReplicatedStorage, featPath);
			const serverScriptService = createPath(baseProject.tree.ServerScriptService, featPath);
			const starterPlayer = createPath(baseProject.tree.StarterPlayer.StarterPlayerScripts, featPath);

			replicatedStorage.$path = { optional: path.join(outputPath, feat.path, "shared") };
			serverScriptService.$path = { optional: path.join(outputPath, feat.path, "server") };
			starterPlayer.$path = { optional: path.join(outputPath, feat.path, "client") };
		} else {
			const targetPath =
				feat.mode === "client"
					? createPath(baseProject.tree.StarterPlayer.StarterPlayerScripts, featPath)
					: createPath(baseProject.tree.ServerScriptService, featPath);

			targetPath.$path = { optional: path.join(outputPath, feat.path) };
		}
	}

	fs.writeFileSync(projectPath, JSON.stringify(baseProject, undefined, "\t"));

	function createPath(node: any, paths: string[]) {
		let current = node;

		for (const path of paths) {
			current[path] ??= { $className: "Folder" };
			current = current[path];
		}

		return current;
	}
}

function loadFeetData({ data }: FeetConfig): FeetData {
	const feetPath = path.resolve(data);
	const feetData = fs.existsSync(feetPath) ? JSON.parse(fs.readFileSync(feetPath, { encoding: "ascii" })) : undefined;
	return feetData ?? { features: [] };
}

function saveFeetData({ data }: FeetConfig, feetData: FeetData) {
	const feetPath = path.resolve(data);
	fs.writeFileSync(feetPath, JSON.stringify(feetData, undefined, "\t"));
}

function loadFeetConfig(): FeetConfig {
	const configPath = path.resolve("./feet.json");
	const configData = fs.existsSync(configPath) ? JSON.parse(fs.readFileSync(configPath, { encoding: "ascii" })) : {};

	return {
		rootDir: "src",
		project: "default.project.json",
		baseProject: "base.project.json",
		data: "big-toe.json",
		...configData,
	};
}
