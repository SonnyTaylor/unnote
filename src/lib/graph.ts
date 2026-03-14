import { getAccessToken } from "./msal";

const GRAPH_BASE = "https://graph.microsoft.com/v1.0";

class GraphClient {
  private async fetch(endpoint: string, options?: RequestInit): Promise<Response> {
    const token = await getAccessToken();
    if (!token) throw new Error("Not authenticated");

    const url = endpoint.startsWith("http") ? endpoint : `${GRAPH_BASE}${endpoint}`;

    return fetch(url, {
      ...options,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });
  }

  private async get<T>(endpoint: string): Promise<T> {
    const response = await this.fetch(endpoint);
    if (!response.ok) {
      throw new Error(`Graph API error: ${response.status} ${response.statusText}`);
    }
    return response.json();
  }

  private async getHtml(endpoint: string): Promise<string> {
    const response = await this.fetch(endpoint);
    if (!response.ok) {
      throw new Error(`Graph API error: ${response.status} ${response.statusText}`);
    }
    return response.text();
  }

  // Encode page/resource IDs (! → %21)
  private encodeId(id: string): string {
    return id.replace(/!/g, "%21");
  }

  // --- User ---
  async getMe() {
    return this.get<GraphUser>("/me");
  }

  // --- Personal Notebooks ---
  async getPersonalNotebooks() {
    return this.get<GraphCollection<Notebook>>("/me/onenote/notebooks");
  }

  async getNotebookSections(notebookId: string) {
    return this.get<GraphCollection<Section>>(`/me/onenote/notebooks/${notebookId}/sections`);
  }

  async getNotebookSectionGroups(notebookId: string) {
    return this.get<GraphCollection<SectionGroup>>(`/me/onenote/notebooks/${notebookId}/sectionGroups`);
  }

  // --- Groups (Class Notebooks) ---
  async getUserGroups() {
    return this.get<GraphCollection<Group>>(
      "/me/memberOf?$select=id,displayName,creationOptions,resourceProvisioningOptions,groupTypes"
    );
  }

  async getGroupNotebooks(groupId: string) {
    return this.get<GraphCollection<Notebook>>(`/groups/${groupId}/onenote/notebooks`);
  }

  async getGroupNotebookSectionGroups(groupId: string, notebookId: string) {
    return this.get<GraphCollection<SectionGroup>>(
      `/groups/${groupId}/onenote/notebooks/${notebookId}/sectionGroups`
    );
  }

  async getGroupSectionGroupSections(groupId: string, sectionGroupId: string) {
    return this.get<GraphCollection<Section>>(
      `/groups/${groupId}/onenote/sectionGroups/${sectionGroupId}/sections`
    );
  }

  async getGroupSectionPages(groupId: string, sectionId: string, top = 100) {
    return this.get<GraphCollection<Page>>(
      `/groups/${groupId}/onenote/sections/${sectionId}/pages?$top=${top}&$orderby=createdDateTime`
    );
  }

  async getGroupPageContent(groupId: string, pageId: string) {
    return this.getHtml(
      `/groups/${groupId}/onenote/pages/${this.encodeId(pageId)}/content`
    );
  }

  // --- Section-level (works for personal notebooks) ---
  async getSectionGroupSections(sectionGroupId: string) {
    return this.get<GraphCollection<Section>>(
      `/me/onenote/sectionGroups/${sectionGroupId}/sections`
    );
  }

  async getSectionPages(sectionId: string, top = 100) {
    return this.get<GraphCollection<Page>>(
      `/me/onenote/sections/${sectionId}/pages?$top=${top}&$orderby=createdDateTime`
    );
  }

  async getPageContent(pageId: string) {
    return this.getHtml(`/me/onenote/pages/${this.encodeId(pageId)}/content`);
  }

  // --- Resources (images, etc.) ---
  async getResource(resourceUrl: string): Promise<Blob> {
    const response = await this.fetch(resourceUrl);
    if (!response.ok) {
      throw new Error(`Resource fetch error: ${response.status}`);
    }
    return response.blob();
  }
}

export const graphClient = new GraphClient();

// --- Types ---
export interface GraphCollection<T> {
  "@odata.context"?: string;
  "@odata.nextLink"?: string;
  value: T[];
}

export interface GraphUser {
  id: string;
  displayName: string;
  mail: string;
  userPrincipalName: string;
  givenName?: string;
  surname?: string;
  jobTitle?: string;
}

export interface Notebook {
  id: string;
  displayName: string;
  createdDateTime: string;
  lastModifiedDateTime: string;
  isDefault: boolean;
  userRole: string;
  isShared: boolean;
  sectionsUrl: string;
  sectionGroupsUrl: string;
  createdBy: { user: { displayName: string } };
  lastModifiedBy: { user: { displayName: string } };
  links: {
    oneNoteClientUrl: { href: string };
    oneNoteWebUrl: { href: string };
  };
}

export interface Section {
  id: string;
  displayName: string;
  createdDateTime: string;
  lastModifiedDateTime: string;
  isDefault: boolean;
  pagesUrl: string;
  createdBy?: { user: { displayName: string } };
  lastModifiedBy?: { user: { displayName: string } };
  parentNotebook?: { id: string; displayName: string };
  parentSectionGroup?: { id: string; displayName: string } | null;
}

export interface SectionGroup {
  id: string;
  displayName: string;
  createdDateTime: string;
  lastModifiedDateTime: string;
  sectionsUrl: string;
  sectionGroupsUrl: string;
  parentNotebook?: { id: string; displayName: string };
}

export interface Page {
  id: string;
  title: string;
  createdDateTime: string;
  lastModifiedDateTime: string;
  contentUrl: string;
  createdByAppId?: string;
  level: number;
  order: number;
  links: {
    oneNoteClientUrl: { href: string };
    oneNoteWebUrl: { href: string };
  };
  parentSection?: { id: string; displayName: string };
}

export interface Group {
  "@odata.type"?: string;
  id: string;
  displayName: string;
  creationOptions?: string[];
  resourceProvisioningOptions?: string[];
  groupTypes?: string[];
}
