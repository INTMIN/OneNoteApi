declare namespace OneNoteApi {
	export enum ContentType {
		Html = 0,
		Image = 1,
		EnhancedUrl = 2,
		Url = 3,
		Onml = 4,
	}

	export interface ResponsePackage<T> {
		parsedResponse: T;
		request: XMLHttpRequest
	}

	export interface Revision {
		target: string;
		action: string;
		content: string;
	}

	/**
	 * Base communication layer for talking to the OneNote APIs.
	 */
	export class OneNoteApiBase {
		constructor(_token: string, _timeout: number, _headers?: { [key: string]: string });

		/**
		 * Whether or not the OneNote Beta APIs should be used.
		 */
		useBetaApi: boolean;

		/**
		 * RequestPromise
		 */
		requestPromise(partialUrl: string, data?: string, contentType?: string): Promise<ResponsePackage<any> | OneNoteApi.RequestError>;

		public static addHeadersToRequest(openRequest: XMLHttpRequest, headers: { [key: string]: string });
	}

	export interface DataPart {
		name: string;
		content: string;
		type: string;
	}

	export class TypedFormData {
		constructor();
		getContentType(): string;
		append(name: string, content: string, type: string): void;
		getData(): string;
	}

	export class OneNotePage {
		constructor(title?: string, _body?: string, _locale?: string, _pageMetadata?: {
			[key: string]: string;
		});

		escapeHtmlEntities(value: string): string;

		getTypedFormData(): TypedFormData;

		addOnml(onml: string);

		addHtml(html: string): string;

		addImage(imgUrl: string);

		addObjectUrlAsImage(url: string);

		addAttachment(binary: ArrayBuffer, name: string): string;

		addUrl(url: string);

		addCitation(format: string, urlToDisplay: string, rawUrl?: string);
	}

	/**
	 * Wrapper for easier calling of the OneNote APIs.
	 */
	export class OneNoteApi extends OneNoteApiBase {
		constructor(token: string, timeout?: number, headers?: { [key: string]: string });

		/**
		 * CreateNotebook
		 */
		createNotebook(name: string): Promise<ResponsePackage<any> | OneNoteApi.RequestError>;

		/**
		 * CreatePage
		 */
		createPage(page: OneNotePage, sectionId?: string): Promise<ResponsePackage<any> | OneNoteApi.RequestError>;

		/**
		 * GetPage
		 */
		getPage(pageId: string): Promise<ResponsePackage<any> | OneNoteApi.RequestError>;

		/**
		 * UpdatePage
		 */
		updatePage(pageId: string, revisions: OneNoteApi.Revision[]): Promise<ResponsePackage<any> | OneNoteApi.RequestError>;

		/**
		 * CreateSection
		 */
		createSection(notebookId: string, name: string): Promise<ResponsePackage<any> | OneNoteApi.RequestError>;

		/**
		 * GetNotebooks
		 */
		getNotebooks(excludeReadOnlyNotebooks?: boolean): Promise<ResponsePackage<any> | OneNoteApi.RequestError>;

		/**
		 * GetNotebooksWithExpandedSections
		 */
		getNotebooksWithExpandedSections(expands?: number, excludeReadOnlyNotebooks?: boolean): Promise<ResponsePackage<any> | OneNoteApi.RequestError>;

		/**
		 * GetNotebookbyName
		 */
		getNotebookByName(name: string): Promise<ResponsePackage<any> | OneNoteApi.RequestError>;

		/**
		 * PagesSearch
		 */
		pagesSearch(query: string): Promise<ResponsePackage<any> | OneNoteApi.RequestError>;
	}

	interface Identifyable {
		id: string;
		self: string;
	}

	interface HistoryTime {
		createdTime: Date;
		lastModifiedTime: Date;
	}

	interface HistoryBy {
		createdBy: string;
		lastModifiedBy: string;
	}

	interface SectionAndSectionGroupParent {
		sectionsUrl: string;
		sectionGroupsUrl: string;
		sections: Section[];
		sectionGroups: SectionGroup[];
	}

	interface PageParent {
		pagesUrl: string;
		pages: Page[];
	}

	export interface Notebook extends Identifyable, HistoryTime, HistoryBy, SectionAndSectionGroupParent {
		name: string;
		isDefault: boolean;
		userRole: Object;
		isShared: boolean;
		links: Object;
	}

	export interface SectionGroup extends Identifyable, HistoryTime, HistoryBy, SectionAndSectionGroupParent {
		name: string;
	}

	export interface Section extends Identifyable, HistoryTime, HistoryBy, PageParent {
		name: string;
		isDefault: boolean;
		parentNotebook?: Notebook;
	}

	export interface Page extends Identifyable, HistoryTime {
		title: string;
		contentUrl: string;
		createdByAppId: string;
		links: {
			oneNoteClientUrl: { href: string };
			oneNoteWebUrl: { href: string };
		};
		thumbnailUrl: string;
	}

	export interface GenericError {
		error: string;
	}

	export interface RequestError extends GenericError {
		timeout?: number;
		statusCode: number;
		response: string;
		responseHeaders: { [key: string]: string };
	}

	export enum RequestErrorType {
		NETWORK_ERROR,
		UNEXPECTED_RESPONSE_STATUS,
		REQUEST_TIMED_OUT,
		UNABLE_TO_PARSE_RESPONSE
	}

	export class ErrorUtils {
		public static createRequestErrorObject(request: XMLHttpRequest, errorType: OneNoteApi.RequestErrorType): OneNoteApi.RequestError;
		public static convertResponseHeadersToJson(request: XMLHttpRequest): { [key: string]: string };
	}

	export type SectionParent = OneNoteApi.Notebook | OneNoteApi.SectionGroup;
	export type SectionPathElement = SectionParent | OneNoteApi.Section;
	export class NotebookUtils {
		public static sectionExistsInNotebooks(notebooks: OneNoteApi.Notebook[], sectionId: string): boolean;
		public static sectionExistsInParent(parent: OneNoteApi.SectionParent, sectionId: string): boolean;
		public static getPathFromNotebooksToSection(notebooks: OneNoteApi.Notebook[], filter: (s: OneNoteApi.Section) => boolean): SectionPathElement[];
		public static getPathFromParentToSection(parent: SectionParent, filter: (s: OneNoteApi.Section) => boolean): SectionPathElement[];
		public static getDepthOfNotebooks(notebooks: OneNoteApi.Notebook[]): number;
		public static getDepthOfParent(parent: SectionParent): number;
	}
}
