namespace paper.editor {
    export abstract class BaseGeo {

        public editorModel: EditorModel;

        public geo: GameObject;

        private baseColor: egret3d.Material;

        public canDrag: boolean = false

        protected helpVec3_1 = new egret3d.Vector3();
        protected helpVec3_2 = new egret3d.Vector3();
        protected helpVec3_3 = new egret3d.Vector3();
        protected helpQuat_1 = new egret3d.Quaternion();
        protected helpQuat_2 = new egret3d.Quaternion();
        protected forward = new egret3d.Vector3(0, 0, 1);
        protected up = new egret3d.Vector3(0, 1, 0);
        protected right = new egret3d.Vector3(1, 0, 0);
        protected _dragOffset: egret3d.Vector3 = new egret3d.Vector3();
        protected _delta: egret3d.Vector3 = new egret3d.Vector3();
        protected _newPosition: egret3d.Vector3 = new egret3d.Vector3();
        protected _ctrlPos: egret3d.Vector3 = new egret3d.Vector3();
        public _ctrlRot: egret3d.Quaternion = new egret3d.Quaternion();
        protected _dragPlanePoint: egret3d.Vector3 = new egret3d.Vector3();
        protected _dragPlaneNormal: egret3d.Vector3 = new egret3d.Vector3();
        protected _initRotation = new egret3d.Quaternion();
        protected _oldLocalScale = new egret3d.Vector3();

        constructor() {
            this.onSet();
            if (this.geo) {
                if (this.geo.getComponent(egret3d.MeshRenderer))
                    this.baseColor = this.geo.getComponent(egret3d.MeshRenderer).materials[0]
            }
        }

        public onSet() {

        }
        public abstract isPressed_local(ray: egret3d.Ray, selectedGameObjs: GameObject[])
        public abstract wasPressed_local(ray: egret3d.Ray, selectedGameObjs: GameObject[])
        public abstract isPressed_world(ray: egret3d.Ray, selectedGameObjs: GameObject[])
        public abstract wasPressed_world(ray: egret3d.Ray, selectedGameObjs: GameObject[])
        public abstract wasReleased(selectedGameObj: GameObject[])
        public _checkIntersect(ray: egret3d.Ray) {
            const mesh = this.geo.getComponent(egret3d.MeshFilter).mesh
            const temp = mesh.raycast(ray, this.geo.transform.getWorldMatrix())
            if (temp) { return this }
        }
        public changeColor(color: string) {
            if (color == "origin") {
                this.geo.getComponent(egret3d.MeshRenderer).materials = [this.baseColor]
            }
            else if (color == "yellow") {
                let mat = this.geo.getComponent(egret3d.MeshRenderer).materials[0].clone()

                let color1 = new Float32Array([0.9, 0.9, 0.7])
                let alpha = new Float32Array([0.3])
                mat.setFloatv("opacity", alpha)
                mat.setVector3v("diffuse", color1);

                this.geo.getComponent(egret3d.MeshRenderer).materials = [mat]
            }
            else if (color == "grey") {
                // let mat = new egret3d.Material(egret3d.DefaultShaders.GIZMOS_COLOR);
                // mat.setVector4v("_Color", [0.3, 0.3, 0.3, 0.5]);
                // this.geo.getComponent(egret3d.MeshRenderer).materials = [mat]
                let mat = this.geo.getComponent(egret3d.MeshRenderer).materials[0].clone()

                let color1 = new Float32Array([0.3, 0.3, 0.3])
                let alpha = new Float32Array([0.4])
                mat.setFloatv("opacity", alpha)
                mat.setVector3v("diffuse", color1);

                this.geo.getComponent(egret3d.MeshRenderer).materials = [mat]

            }
        }

        protected _createAxis(color: egret3d.Vector4, type: number): GameObject {
            let gizmoAxis = new paper.GameObject("", "", Application.sceneManager.editorScene);

            let mesh = gizmoAxis.addComponent(egret3d.MeshFilter);
            switch (type) {
                case 0:
                    mesh.mesh = egret3d.DefaultMeshes.CUBE;
                    break;
                case 1:
                    mesh.mesh = this._createCircleLine();
                    break;
                case 2:
                    mesh.mesh = egret3d.DefaultMeshes.CUBE;
                    break;
                case 3:
                    mesh.mesh = egret3d.DefaultMeshes.PLANE;
                    break;
            }
            let renderer = gizmoAxis.addComponent(egret3d.MeshRenderer);

            let mat = new egret3d.Material(egret3d.DefaultShaders.LINEDASHED);
            let color1 = new Float32Array([color.x, color.y, color.z])
            let alpha = new Float32Array([color.w])
            let technique = mat.glTFTechnique

            const funs = technique.states.functions;
            const enables = technique.states.enable;
            // const index = enables.indexOf(gltf.EnableState.DEPTH_TEST);

            mat.setFloatv("opacity", alpha)
            mat.setVector3v("diffuse", color1);
            renderer.materials = [mat];

            // if (enables.indexOf(gltf.EnableState.DEPTH_TEST) >= 0) {
            //     enables.splice(enables.indexOf(gltf.EnableState.DEPTH_TEST), 1);
            // }
            if (enables.indexOf(gltf.EnableState.CULL_FACE) >= 0) {
                enables.splice(enables.indexOf(gltf.EnableState.CULL_FACE), 1);
            }
            // funs.depthMask = [false];
            funs.depthMask = [true];
            funs.depthFunc = [gltf.DepthFunc.ALWAYS];
            delete funs.frontFace;
            delete funs.cullFace;
            funs.blendEquationSeparate = [gltf.BlendEquation.FUNC_ADD, gltf.BlendEquation.FUNC_ADD];
            funs.blendFuncSeparate = [gltf.BlendFactor.SRC_ALPHA, gltf.BlendFactor.ONE_MINUS_SRC_ALPHA, gltf.BlendFactor.ONE, gltf.BlendFactor.ONE_MINUS_SRC_ALPHA];
            return gizmoAxis;
        }

        protected _createCircleLine() {
            var vertexCount = 1;
            var triangleFan = [];
            var indices = [];
            for (var angle = 0; angle <= 360; angle += 1) {
                var x = Math.cos(angle / 180.0 * 3.14) / 1.03;
                var y = Math.sin(angle / 180.0 * 3.14) / 1.03;
                var z = 0.0;
                triangleFan.push(x, y, z);

                var x = Math.cos(angle / 180.0 * 3.14);
                var y = Math.sin(angle / 180.0 * 3.14);
                var z = 0.0;
                triangleFan.push(x, y, z);
                vertexCount++;
            }
            console.log(vertexCount)
            for (var angle = 0; angle <= vertexCount * 2 - 3; angle += 1) {
                indices.push(angle, angle + 1, angle + 2);
            }
            var mesh = new egret3d.Mesh(vertexCount * 2, (vertexCount * 2 - 3) * 3);
            mesh.setIndices(indices);
            mesh.setAttributes(gltf.MeshAttributeType.POSITION, triangleFan)
            return mesh
        }
    }


    export class GeoContainer extends BaseGeo {
        private geos: BaseGeo[] = []
        private selectedGeo: BaseGeo
        constructor() {
            super();
            this.changeType("position")
        }

        onSet() {
            let controller = new paper.GameObject("", "", Application.sceneManager.editorScene);
            controller.activeSelf = false;
            controller.name = "GizmoController";
            controller.tag = "Editor";
            this.geo = controller
        }

        public checkIntersect(ray: egret3d.Ray) {
            for (let item of this.geos) {
                const temp = item._checkIntersect(ray)
                if (temp) { return temp }
            }
        }

        private clear() {
            if (this.geos) {
                for (let item of this.geos) {
                    item.geo.destroy()
                    item.geo = null;
                }
            }
            this.geos = []
        }
        // public clearAll() {
        //     this.clear();
        //     this.selectedGeo = null;
        // }
        changeType(type: string) {
            this.clear();
            switch (type) {
                case "position":
                    {
                        let x = new xAxis
                        let y = new yAxis
                        let z = new zAxis
                        let xy = new xyAxis
                        let xz = new xzAxis
                        let yz = new yzAxis
                        this.geos.push(x, y, z, xy, xz, yz)
                    }
                    break;
                case "rotation":
                    {
                        let x = new xRot
                        let y = new yRot
                        let z = new zRot
                        this.geos.push(x, y, z)
                    }

                    break;
                case "scale":
                    {
                        let x = new xScl
                        let y = new yScl
                        let z = new zScl
                        this.geos.push(x, y, z)
                    }
                    break;
            }
            for (let geo of this.geos) {
                geo.editorModel = this.editorModel
                geo.geo.transform.setParent(this.geo.transform)
            }
        }
        wasPressed_local(ray: egret3d.Ray, selected: any) {
            const result = this.checkIntersect(ray)
            if (result) {
                console.log(result.geo.name)
                result.wasPressed_local(ray, selected)
                this.selectedGeo = result

                for (let item of this.geos) {
                    item.changeColor('grey')
                }
                this.selectedGeo.changeColor('yellow')
                return;
            }
            this.selectedGeo = null
            return null;
        }
        isPressed_local(ray: egret3d.Ray, selected: any) {
            if (this.selectedGeo) {
                this.selectedGeo.isPressed_local(ray, selected)
                this.geo.transform.setLocalPosition(selected[0].transform.getPosition())
                this.geo.transform.setLocalRotation(selected[0].transform.getRotation())
            }
        }
        wasPressed_world(ray: egret3d.Ray, selected: any) {
            let ctrlRot = this.geo.transform.getRotation();
            const result = this.checkIntersect(ray)
            if (result) {
                console.log(result.geo.name)
                this._ctrlRot = ctrlRot;
                result.wasPressed_world(ray, selected)
                this.selectedGeo = result

                for (let item of this.geos) {
                    item.changeColor('grey')
                }
                this.selectedGeo.changeColor('yellow')
                return;
            }
            this.selectedGeo = null
            return null;

        }
        isPressed_world(ray: egret3d.Ray, selected: any) {
            if (this.selectedGeo) {
                this.selectedGeo.isPressed_world(ray, selected)
                let len = selected.length
                let ctrlPos = egret3d.Vector3.set(0, 0, 0, this.helpVec3_3);
                for (let i = 0; i < len; i++) {
                    // console.log("select: " + i + " " + this.selectedGameObjs[i].name);
                    let obj = selected[i];
                    egret3d.Vector3.add(obj.transform.getPosition(), ctrlPos, ctrlPos);
                }
                ctrlPos = egret3d.Vector3.scale(ctrlPos, 1 / len);
                if (this.selectedGeo._ctrlRot) {
                    this._ctrlRot.copy(this.selectedGeo._ctrlRot)
                    this.geo.transform.setRotation(this._ctrlRot);
                }
                this.geo.transform.setPosition(ctrlPos);

            }

        }
        wasReleased(selectedGameObjs: GameObject[]) {
            if (this.selectedGeo) {
                this.selectedGeo.wasReleased(selectedGameObjs);
                for (let item of this.geos) {
                    item.changeColor('origin')
                }
                this.selectedGeo = null
            }
        }
    }
}