const {
	ContainerBuilder,
	TextDisplayBuilder,
	SeparatorBuilder,
	SectionBuilder,
	ButtonBuilder,
	ButtonStyle,
	MessageFlags,
	SeparatorSpacingSize,
} = require('discord.js');

function successContainer(title, description) {
	return {
		components: [
			new ContainerBuilder()
				.setAccentColor(0x2ecc71)
				.addTextDisplayComponents(
					(text) => text.setContent(`## ✅ ${title}`),
				)
				.addSeparatorComponents((sep) => sep.setDivider(true).setSpacing(SeparatorSpacingSize.Small))
				.addTextDisplayComponents(
					(text) => text.setContent(description),
				),
		],
		flags: MessageFlags.IsComponentsV2,
	};
}

function errorContainer(title, description) {
	return {
		components: [
			new ContainerBuilder()
				.setAccentColor(0xe74c3c)
				.addTextDisplayComponents(
					(text) => text.setContent(`## ❌ ${title}`),
				)
				.addSeparatorComponents((sep) => sep.setDivider(true).setSpacing(SeparatorSpacingSize.Small))
				.addTextDisplayComponents(
					(text) => text.setContent(description),
				),
		],
		flags: MessageFlags.IsComponentsV2,
	};
}

function infoContainer(title, description) {
	return {
		components: [
			new ContainerBuilder()
				.setAccentColor(0x3498db)
				.addTextDisplayComponents(
					(text) => text.setContent(`## ℹ️ ${title}`),
				)
				.addSeparatorComponents((sep) => sep.setDivider(true).setSpacing(SeparatorSpacingSize.Small))
				.addTextDisplayComponents(
					(text) => text.setContent(description),
				),
		],
		flags: MessageFlags.IsComponentsV2,
	};
}

function warningContainer(title, description) {
	return {
		components: [
			new ContainerBuilder()
				.setAccentColor(0xf39c12)
				.addTextDisplayComponents(
					(text) => text.setContent(`## ⚠️ ${title}`),
				)
				.addSeparatorComponents((sep) => sep.setDivider(true).setSpacing(SeparatorSpacingSize.Small))
				.addTextDisplayComponents(
					(text) => text.setContent(description),
				),
		],
		flags: MessageFlags.IsComponentsV2,
	};
}

function confirmContainer(title, description, confirmId, cancelId) {
	return {
		components: [
			new ContainerBuilder()
				.setAccentColor(0xf39c12)
				.addTextDisplayComponents(
					(text) => text.setContent(`## ⚠️ ${title}`),
				)
				.addSeparatorComponents((sep) => sep.setDivider(true).setSpacing(SeparatorSpacingSize.Small))
				.addTextDisplayComponents(
					(text) => text.setContent(description),
				)
				.addActionRowComponents((row) =>
					row.addComponents(
						new ButtonBuilder()
							.setCustomId(confirmId)
							.setLabel('✅ تأكيد')
							.setStyle(ButtonStyle.Success),
						new ButtonBuilder()
							.setCustomId(cancelId)
							.setLabel('❌ إلغاء')
							.setStyle(ButtonStyle.Danger),
					),
				),
		],
		flags: MessageFlags.IsComponentsV2,
	};
}

function khatContainer() {
	return {
		components: [
			new ContainerBuilder()
				.setAccentColor(0x9b59b6)
				.addTextDisplayComponents(
					(text) => text.setContent('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'),
				),
		],
		flags: MessageFlags.IsComponentsV2,
	};
}

module.exports = {
	successContainer,
	errorContainer,
	infoContainer,
	warningContainer,
	confirmContainer,
	khatContainer,
};
