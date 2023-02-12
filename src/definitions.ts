import { Command } from "commander";
import { handleAddCommand, handleRemoveCommand } from "./commands";
import figlet from "figlet";

export function createAddCommand() {
	return new Command()
		.name("add")
		.description("Add a new feature")
		.argument("<feat>", "The name of the feature, a path relative to src")
		.option("-s, --server", "Server only feature.")
		.option("-c, --client", "Client only feature.")
		.option("-sh, --shared", "Generate a shared folder in a feature.")
		.action(handleAddCommand);
}

export function createRemoveCommand() {
	return new Command()
		.name("remove")
		.description("Remove an existing feature")
		.argument("<feat>", "The name of the feature, a path relative to src")
		.option("-p, --preserve", "Preserve the source directory.", false)
		.action(handleRemoveCommand);
}

export function createRootCommand() {
	return new Command()
		.name("feet")
		.description("A command line tool to manage feature-based organization for your Rojo project.")
		.addHelpText("beforeAll", figlet.textSync("Feet"))
		.addCommand(createAddCommand())
		.addCommand(createRemoveCommand());
}
