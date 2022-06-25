const catchAsync = require('./../utils/catchAsync');
const GlobalError = require('./../utils/globalError');

const QueryFeatures = require('./../utils/queryFeatures');

exports.getAll = (Model) => {

    return catchAsync(async (req, res, next) => {
        let filters;
        if(request.params.tourId) {
            filters = { 'tour' : request.params.tourId };
        }    
        let myQuery = new QueryFeatures(Model, req.query, filters);
        myQuery.filterQueries().sort().fields().paginate();
        
        const documents = await myQuery.query;
        res.status(200).json({
            status: 'success',
            results: documents.length,
            data: {
                    documents 
            }
        }); 
    });
    
}

exports.createOne = (Model) => {
    return catchAsync(async (req, res, next) => {
        let newDocument = await Model.create(req.body);
        res.status(201).json({
            status: 'success',  
            data: { 
                document: newTour
            }
        });
    });
}

exports.getOne = (Model, populateOptions) => {
    return catchAsync(async (req, res, next) => {
        let query = Model.findOne({ _id: req.params.id });
        if(populateOptions) {
            query = query.populate(populateOptions);
        }
        const getDocument = await query;
        if(!getDocument) { 
            return next(new GlobalError(404,'Document does not exist')); 
        }
        return res.status(200).json({
            status: 'success',
            data: {
                document: getDocument
            }
        });
    });
    
}

exports.updateOne = (Model) => {
    return catchAsync(async (req, res, next) => {
        const documentToBeUpdated = await Model.findOneAndUpdate({_id: req.params.id}, req.body, { new: true, runValidators: true });
        if(!documentToBeUpdated) {
         return next(new GlobalError(404, 'Document does not exist'))
        }
        res.status(203).json({
            status: 'success',
            data: {
                data: documentToBeUpdated
            }
        })
    });
}


exports.deleteOne = (Model) => {
    return  catchAsync(async (req, res, next) => {
        const deletedDocument = await Model.findOneAndDelete({ _id: req.params.id});
        if(!deletedDocument) {
            return next(new GlobalError(404, 'Document does not exist at ID'))
           }   
        res.status(204).json({
            status: 'success',
            message: 'Deleted successfully',
        });
    });
    
}
